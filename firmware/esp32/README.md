# MediMind Pro - Firmware ESP32

Firmware para ESP32 que detecta píldoras y publica eventos vía MQTT.

## Requisitos

- PlatformIO
- ESP32 DevKit
- WiFi
- MQTT Broker

## Configuración

1. Editar `src/main.cpp`:
   - Configurar WiFi SSID y password
   - Configurar IP del broker MQTT
   - Configurar device_id

2. Compilar y subir:
```bash
pio run -t upload
pio device monitor
```

## Sensores

- **Load Cell (HX711)**: Detecta peso de píldoras
- **Sensor IR**: Detecta presencia (opcional)

## Topics MQTT

- Publica: `medibox/<device_id>/event`
- Suscribe: `medibox/<device_id>/alert`

## Notas

- El código incluye simulación de sensores para pruebas sin hardware
- Para uso en producción, implementar drivers reales de HX711

