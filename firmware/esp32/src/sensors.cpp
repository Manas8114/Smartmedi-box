#include "sensors.h"
#include <Arduino.h>

void SensorManager::init() {
  pinMode(IR_SENSOR_PIN, INPUT);
  Serial.println("Sensores inicializados");
  
  // Calibrar peso inicial
  delay(1000);
  calibrateWeight();
}

float SensorManager::readWeight() {
  // Simulación de lectura de celda de carga
  // En producción, usarías la librería HX711
  
  // Por ahora, simulación con valores aleatorios
  static float baseWeight = 100.0;
  static float variation = 0;
  
  // Simular lectura de sensor
  variation += (random(-10, 10) / 100.0);
  if (variation > 5.0) variation = 5.0;
  if (variation < -5.0) variation = -5.0;
  
  float weight = baseWeight + variation;
  
  // Simular remoción de píldora (caída brusca de peso)
  static unsigned long lastDrop = 0;
  if (millis() - lastDrop > 30000) {  // Cada 30 segundos para demo
    if (random(0, 100) < 10) {  // 10% probabilidad
      weight -= random(5, 15);
      lastDrop = millis();
    }
  }
  
  return weight;
}

bool SensorManager::readIR() {
  // Leer sensor IR (detectar presencia)
  return digitalRead(IR_SENSOR_PIN) == LOW;  // LOW = objeto detectado
}

float SensorManager::calibrateWeight() {
  // Calibrar peso base
  float sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += readWeight();
    delay(100);
  }
  weightInitialized = true;
  Serial.printf("Peso calibrado: %.2fg\n", sum / 10.0);
  return sum / 10.0;
}

