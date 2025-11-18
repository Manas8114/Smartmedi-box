#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <string.h>
#include "sensors.h"
#include "wifi_mqtt.h"

// WiFi Configuration
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// MQTT Configuration
const char* mqtt_server = "192.168.1.100";  // MQTT broker IP
const int mqtt_port = 1883;
const char* device_id = "medibox_001";
const char* event_topic = "medibox/medibox_001/event";
const char* alert_topic = "medibox/medibox_001/alert";

// Global objects
WiFiClient espClient;
PubSubClient mqtt_client(espClient);
SensorManager sensorManager;

// Control variables
unsigned long lastWeightCheck = 0;
const unsigned long weightCheckInterval = 1000;  // 1 second
float lastWeight = 0.0;
const float weightThreshold = 5.0;  // Threshold in grams

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== MediMind Pro ESP32 ===");
  
  // Initialize sensors
  sensorManager.init();
  
  // Connect WiFi
  setup_wifi();
  
  // Configure MQTT
  mqtt_client.setServer(mqtt_server, mqtt_port);
  mqtt_client.setCallback(mqtt_callback);
  
  Serial.println("System initialized");
}

void loop() {
  // Reconnect MQTT if necessary
  if (!mqtt_client.connected()) {
    reconnect_mqtt();
  }
  mqtt_client.loop();
  
  // Check weight every interval
  unsigned long currentMillis = millis();
  if (currentMillis - lastWeightCheck >= weightCheckInterval) {
    checkPillEvent();
    lastWeightCheck = currentMillis;
  }
  
  delay(100);
}

void checkPillEvent() {
  float currentWeight = sensorManager.readWeight();
  
  // Detect weight drop (pill removed)
  float weightDiff = lastWeight - currentWeight;
  
  if (weightDiff > weightThreshold && lastWeight > 0) {
    // Pill removed
    publishPillEvent(currentWeight, weightDiff);
    Serial.printf("Pill detected! Weight: %.2fg, Difference: %.2fg\n", 
                  currentWeight, weightDiff);
  }
  
  lastWeight = currentWeight;
}

void publishPillEvent(float weight, float weightDiff) {
  if (!mqtt_client.connected()) {
    return;
  }
  
  // Create JSON with sufficient size
  StaticJsonDocument<256> doc;
  doc["device_id"] = device_id;
  doc["pill_removed"] = true;
  doc["weight"] = weight;
  doc["weight_diff"] = weightDiff;
  doc["timestamp"] = (unsigned long)millis();  // Explicit cast to avoid overflow issues
  
  // Larger buffer to avoid overflow
  char jsonBuffer[256];
  size_t written = serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));
  
  if (written == 0 || written >= sizeof(jsonBuffer)) {
    Serial.println("Error: Insufficient buffer or JSON too large");
    return;
  }
  
  // Publish with QoS 1
  if (mqtt_client.publish(event_topic, jsonBuffer, true)) {
    Serial.println("Event published successfully");
  } else {
    Serial.println("Error publishing event");
  }
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  
  // Limit message length to avoid memory issues
  const size_t maxLength = 200;
  // Use local variable instead of modifying parameter
  unsigned int messageLength = (length > maxLength) ? maxLength : length;
  
  // Process alerts
  if (strstr(topic, "alert") != NULL) {
    // Use static buffer instead of String to avoid fragmentation
    char messageBuffer[maxLength + 1];
    memset(messageBuffer, 0, sizeof(messageBuffer));
    
    for (unsigned int i = 0; i < messageLength && i < maxLength; i++) {
      messageBuffer[i] = (char)payload[i];
    }
    messageBuffer[messageLength] = '\0';
    
    Serial.print("Alert received: ");
    Serial.println(messageBuffer);
    
    // Convert to String only when necessary
    String message = String(messageBuffer);
    handleAlert(message);
  }
}

void handleAlert(String message) {
  // Process alert (activate LED, buzzer, etc.)
  Serial.println("Processing alert: " + message);
  // Example: digitalWrite(LED_PIN, HIGH);
}

