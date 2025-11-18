import mqtt from 'mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
  }

  connect(deviceId) {
    // Disconnect existing connection if any
    if (this.client) {
      if (this.isConnected) {
        console.log('MQTT ya está conectado, desconectando primero...');
        this.disconnect();
      } else {
        // Clean up disconnected client
        this.client.removeAllListeners();
        this.client = null;
      }
    }

    const brokerUrl = process.env.REACT_APP_MQTT_BROKER || 'ws://localhost:9001';
    console.log(`Conectando a MQTT broker: ${brokerUrl}`);
    
    this.client = mqtt.connect(brokerUrl, {
      clientId: `web_${Date.now()}`,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    });

    this.client.on('connect', () => {
      console.log('✅ Conectado a MQTT broker');
      this.isConnected = true;
      
      // Suscribirse a todos los topics que tienen callbacks guardados
      // This will handle both device topics and any other registered topics
      this.subscriptions.forEach((callback, topic) => {
        if (this.client && this.isConnected) {
          this.client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
              console.error(`Error suscribiéndose a ${topic}:`, err);
            } else {
              console.log(`📡 Suscrito a: ${topic}`);
            }
          });
        }
      });
      
      // If deviceId is provided but no callbacks are registered yet,
      // subscribe to default topics (callbacks will be registered separately)
      if (deviceId && this.subscriptions.size === 0) {
        const eventTopic = `medibox/${deviceId}/event`;
        const alertTopic = `medibox/${deviceId}/alert`;
        
        this.client.subscribe(eventTopic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Error suscribiéndose a ${eventTopic}:`, err);
          } else {
            console.log(`📡 Suscrito a: ${eventTopic}`);
          }
        });
        
        this.client.subscribe(alertTopic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Error suscribiéndose a ${alertTopic}:`, err);
          } else {
            console.log(`📡 Suscrito a: ${alertTopic}`);
          }
        });
      }
    });

    this.client.on('error', (error) => {
      console.error('Error MQTT:', error);
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      console.log('🔄 Reconectando a MQTT...');
    });

    this.client.on('message', (topic, message) => {
      const callback = this.subscriptions.get(topic);
      if (callback) {
        try {
          const data = JSON.parse(message.toString());
          callback(data);
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      }
    });
  }

  subscribe(topic, callback) {
    // Guardar callback si se proporciona
    if (callback) {
      this.subscriptions.set(topic, callback);
    }
    
    if (this.client && this.isConnected) {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error suscribiéndose a ${topic}:`, err);
        } else {
          console.log(`📡 Suscrito a: ${topic}`);
        }
      });
    } else {
      console.log(`⏳ Suscripción a ${topic} pendiente (esperando conexión)`);
    }
  }

  unsubscribe(topic) {
    if (this.client && this.isConnected) {
      this.client.unsubscribe(topic);
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client && this.isConnected) {
      // Unsubscribe from all topics first
      this.subscriptions.forEach((callback, topic) => {
        try {
          this.client.unsubscribe(topic);
        } catch (err) {
          console.error(`Error unsubscribing from ${topic}:`, err);
        }
      });
      
      // Clear subscriptions
      this.subscriptions.clear();
      
      // End connection
      this.client.end(false, () => {
        console.log('✅ MQTT client disconnected');
      });
      
      this.isConnected = false;
      this.client = null;
    }
  }

  onMessage(topic, callback) {
    this.subscriptions.set(topic, callback);
  }
}

export default new MQTTService();

