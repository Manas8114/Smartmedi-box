# Guía de Configuración Rápida - MediMind Pro

## 📦 Instalación Paso a Paso

### 1. Instalar MQTT Broker (Mosquitto)

#### Windows
```powershell
# Opción 1: Chocolatey
choco install mosquitto

# Opción 2: Descargar instalador
# https://mosquitto.org/download/
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

#### Mac
```bash
brew install mosquitto
brew services start mosquitto
```

#### Configurar Mosquitto
1. Copiar `mosquitto.conf.example` a `mosquitto.conf`
2. Ajustar configuración según necesidad
3. Iniciar: `mosquitto -c mosquitto.conf`

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
echo "PORT=3000" > .env
echo "MQTT_BROKER=mqtt://localhost:1883" >> .env
echo "JWT_SECRET=tu_secreto_seguro_aqui" >> .env

# Iniciar
npm start
```

### 3. Configurar Frontend

```bash
cd web
npm install

# Crear archivo .env
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
echo "REACT_APP_MQTT_BROKER=ws://localhost:9001" >> .env

# Iniciar
npm start
```

### 4. Configurar ESP32

1. Instalar PlatformIO en VS Code
2. Abrir carpeta `firmware/esp32`
3. Editar `src/main.cpp`:
   - Cambiar `TU_WIFI_SSID` por tu SSID WiFi
   - Cambiar `TU_WIFI_PASSWORD` por tu contraseña
   - Cambiar `mqtt_server` por la IP de tu broker (ej: `192.168.1.100`)
4. Compilar y subir:
   ```bash
   pio run -t upload
   pio device monitor
   ```

## 🔍 Verificación

### Verificar MQTT Broker
```bash
# Suscribirse a todos los topics
mosquitto_sub -h localhost -t 'medibox/#' -v

# Publicar mensaje de prueba
mosquitto_pub -h localhost -t 'medibox/test/event' -m '{"test": true}'
```

### Verificar Backend
```bash
# Health check
curl http://localhost:3000/health

# Debe responder: {"status":"ok","message":"MediMind Pro Backend"}
```

### Verificar Frontend
1. Abrir http://localhost:3000
2. Registrar usuario
3. Verificar que el dashboard cargue

## 🐛 Solución de Problemas Comunes

### MQTT no conecta
- Verificar que Mosquitto esté corriendo: `mosquitto -v`
- Verificar firewall (puertos 1883, 9001)
- Verificar IP del broker en ESP32

### Backend no recibe eventos
- Verificar logs del backend
- Verificar que MQTT broker esté corriendo
- Verificar conexión del ESP32

### Frontend no muestra datos
- Verificar consola del navegador
- Verificar que el backend esté corriendo
- Verificar token de autenticación

### ESP32 no conecta a WiFi
- Verificar que la red sea 2.4GHz (no 5GHz)
- Verificar credenciales WiFi
- Verificar señal WiFi

## 📝 Notas Importantes

1. **MQTT WebSocket**: Para que el frontend se conecte vía WebSocket, Mosquitto debe tener el listener 9001 configurado
2. **Device ID**: El `device_id` usado en el registro debe coincidir con el del ESP32
3. **IP del Broker**: Si el broker está en otra máquina, cambiar `localhost` por la IP correspondiente
4. **Seguridad**: En producción, cambiar `JWT_SECRET` y configurar autenticación MQTT

## 🚀 Inicio Rápido

```bash
# Terminal 1: MQTT Broker
mosquitto -c mosquitto.conf

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
cd web && npm start

# Terminal 4: ESP32 (si está conectado)
cd firmware/esp32 && pio device monitor
```



ovel aspects
1. Real-time weight-based pill detection
Uses load cell sensors (HX711) to detect pill removal via weight changes
Threshold-based detection (5g threshold) to distinguish pill removal from noise
More reliable than simple button presses or timers
2. Bidirectional MQTT communication architecture
ESP32 → Backend: Real-time event publishing
Backend → ESP32: Alert delivery to the device
Frontend → ESP32: Web dashboard can trigger device alerts
Enables real-time, two-way communication between hardware and software
3. Hybrid MQTT + REST architecture
MQTT for real-time IoT communication (ESP32 ↔ Backend)
REST API for traditional web operations
WebSocket MQTT for frontend real-time updates
Combines IoT protocols with web standards
4. Real-time web dashboard with live visualization
Live charts updating via MQTT WebSocket
Real-time event streaming without polling
Statistics cards that auto-update
Modern React + TailwindCSS interface
5. Edge computing on ESP32
Local sensor processing and event detection
Autonomous operation with WiFi reconnection
Memory-efficient JSON serialization
QoS 1 MQTT for reliable message delivery
6. Lightweight local database architecture
SQLite for local storage (no cloud dependency)
Suitable for home/private deployments
Full event history with minimal overhead
7. Planned AI integration (future)
TensorFlow Lite Micro for pill recognition (mentioned in upcoming features)
Would enable visual identification of specific medications
Technical innovations
Multi-protocol integration: MQTT, REST, WebSocket in one system
Device-user binding: JWT authentication links users to specific ESP32 devices
Event-driven architecture: Weight changes trigger automatic event publishing
Graceful degradation: System continues operating even if some components fail
What makes it stand out
Most medication systems rely on manual input or simple timers
This system automatically detects medication removal via weight sensors
Real-time bidirectional communication enables immediate alerts and monitoring
Open-source, customizable, and privacy-focused (local database)
Potential impact
Elderly care: Automatic tracking without user interaction
Medication adherence: Real-time monitoring and alerts
Healthcare providers: Remote monitoring capabilities
Research: Data collection for medication compliance studies
The combination of automatic detection, real-time communication, and a modern web interface makes this a practical IoT solution for medication management.