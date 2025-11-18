#include "wifi_mqtt.h"

extern const char* ssid;
extern const char* password;
extern const char* mqtt_server;
extern const int mqtt_port;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("Error connecting to WiFi");
  }
}

void reconnect_mqtt() {
  // Limit reconnection attempts to avoid blocking
  const int maxReconnectAttempts = 5;
  int attempts = 0;
  
  while (!mqtt_client.connected() && attempts < maxReconnectAttempts) {
    Serial.print("Attempting MQTT connection...");
    
    // Try to connect with device_id as client ID
    if (mqtt_client.connect(device_id)) {
      Serial.println("connected!");
      
      // Subscribe to alert topic
      mqtt_client.subscribe(alert_topic, 1);
      Serial.print("Subscribed to: ");
      Serial.println(alert_topic);
      attempts = 0;  // Reset counter on success
      return;
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt_client.state());
      Serial.print(" attempt ");
      Serial.print(attempts + 1);
      Serial.print("/");
      Serial.print(maxReconnectAttempts);
      Serial.println(" retrying in 5 seconds");
      attempts++;
      delay(5000);
    }
  }
  
  if (attempts >= maxReconnectAttempts) {
    Serial.println("Error: Maximum reconnection attempts reached");
    // Allow loop to continue, will retry in next iteration
  }
}

