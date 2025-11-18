const mqtt = require('mqtt');
const db = require('./db');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
let client = null;
let isInitialized = false;

function init() {
  // Prevent multiple initializations
  if (isInitialized && client && client.connected) {
    console.log('MQTT already initialized and connected');
    return;
  }
  
  // Clean up existing client if any
  if (client) {
    client.removeAllListeners();
    if (client.connected) {
      client.end();
    }
    client = null;
  }
  
  console.log(`🔌 Connecting to MQTT broker: ${MQTT_BROKER}`);
  
  client = mqtt.connect(MQTT_BROKER, {
    clientId: 'medimind-backend',
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
  });
  
  isInitialized = true;

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
    
    // Subscribe to all device events
    client.subscribe('medibox/+/event', { qos: 1 }, (err) => {
      if (err) {
        console.error('Error subscribing to events:', err);
      } else {
        console.log('📡 Subscribed to: medibox/+/event');
      }
    });
  });

  client.on('error', (err) => {
    console.error('Error MQTT:', err);
  });

  client.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT...');
  });

  client.on('message', async (topic, message) => {
    try {
      // Validate message is not empty
      if (!message || message.length === 0) {
        console.warn('Empty message received, skipping');
        return;
      }

      let data;
      try {
        data = JSON.parse(message.toString());
      } catch (parseError) {
        console.error('Error parsing JSON message:', parseError.message);
        console.error('Message content:', message.toString().substring(0, 100));
        return;
      }

      console.log(`📨 Message received on ${topic}:`, data);
      
      // Extract device_id from topic or message
      const topicParts = topic.split('/');
      const deviceId = data.device_id || topicParts[1];
      
      if (!deviceId) {
        console.error('Device ID not found in message or topic');
        return;
      }
      
      if (data.pill_removed) {
        // Save event to database
        try {
          await db.insertEvent(
            deviceId,
            data.pill_removed,
            data.weight,
            data.weight_diff,
            data.timestamp || Date.now()
          );
          console.log(`💊 Pill event saved for device: ${deviceId}`);
        } catch (dbError) {
          console.error('Error saving event to database:', dbError);
          // Don't throw - continue processing other messages
        }
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
      // Continue processing other messages
    }
  });

  client.on('close', () => {
    console.log('🔌 MQTT connection closed');
  });
}

function publishAlert(deviceId, message) {
  return new Promise((resolve, reject) => {
    if (!client || !client.connected) {
      reject(new Error('MQTT client not connected'));
      return;
    }

    const topic = `medibox/${deviceId}/alert`;
    const payload = JSON.stringify({
      message: message,
      timestamp: Date.now()
    });

    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('Error publishing alert:', err);
        reject(err);
        return;
      }
      console.log(`📢 Alert published on ${topic}: ${message}`);
      
      // Save alert to database
      db.insertAlert(deviceId, message)
        .then(() => resolve())
        .catch(reject);
    });
  });
}

function getClient() {
  return client;
}

function close() {
  return new Promise((resolve) => {
    if (!client) {
      isInitialized = false;
      resolve();
      return;
    }
    
    // Unsubscribe from all topics
    try {
      client.unsubscribe('medibox/+/event');
    } catch (err) {
      console.error('Error unsubscribing from topics:', err);
    }
    
    // Remove all event listeners to prevent memory leaks
    client.removeAllListeners();
    
    // Close connection
    client.end(false, () => {
      console.log('✅ MQTT client closed');
      client = null;
      isInitialized = false;
      resolve();
    });
  });
}

module.exports = {
  init,
  publishAlert,
  getClient,
  close
};

