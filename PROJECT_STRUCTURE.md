# Estructura del Proyecto MediMind Pro

## 📁 Estructura de Carpetas

```
medimind-pro/
│
├── firmware/                 # Firmware ESP32
│   └── esp32/
│       ├── platformio.ini    # Configuración PlatformIO
│       ├── src/
│       │   ├── main.cpp      # Código principal
│       │   ├── sensors.cpp   # Lógica de sensores
│       │   ├── sensors.h     # Headers de sensores
│       │   ├── wifi_mqtt.cpp # WiFi y MQTT
│       │   └── wifi_mqtt.h   # Headers WiFi/MQTT
│       └── README.md
│
├── backend/                  # Backend Node.js
│   ├── index.js             # Servidor principal
│   ├── db.js                # Base de datos SQLite
│   ├── mqtt.js              # Cliente MQTT
│   ├── api.js               # Rutas REST API
│   ├── package.json         # Dependencias
│   ├── .env.example         # Variables de entorno (ejemplo)
│   └── README.md
│
├── web/                      # Frontend React
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── index.js         # Punto de entrada
│   │   ├── components/      # Componentes React
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── AlertButton.jsx
│   │   │   └── RealTimeChart.jsx
│   │   └── services/        # Servicios
│   │       ├── api.js       # Cliente API
│   │       ├── AuthService.js  # Autenticación
│   │       └── mqttService.js  # Cliente MQTT
│   ├── package.json
│   ├── tailwind.config.js   # Configuración Tailwind
│   ├── postcss.config.js    # Configuración PostCSS
│   └── .env.example         # Variables de entorno (ejemplo)
│
├── README.md                 # Documentación principal
├── SETUP.md                  # Guía de configuración
├── QUICK_START.md           # Inicio rápido
├── PROJECT_STRUCTURE.md     # Este archivo
├── mosquitto.conf.example   # Configuración MQTT (ejemplo)
├── start.bat                # Script inicio Windows
├── start.sh                 # Script inicio Linux/Mac
└── .gitignore              # Archivos a ignorar
```

## 🔄 Flujo de Datos

```
ESP32 (Firmware)
    │
    │ MQTT Publish
    ↓
MQTT Broker (Mosquitto)
    │
    │ MQTT Subscribe
    ↓
Backend (Node.js)
    │
    │ Store in SQLite
    ↓
Database (SQLite)
    │
    │ REST API
    ↓
Frontend (React)
    │
    │ WebSocket MQTT
    ↓
MQTT Broker (Mosquitto)
    │
    │ Real-time updates
    ↓
Frontend (React Dashboard)
```

## 📡 Topics MQTT

- **Publicación (ESP32 → Broker)**:
  - `medibox/<device_id>/event` - Eventos de píldoras

- **Suscripción (Broker → ESP32)**:
  - `medibox/<device_id>/alert` - Alertas

- **Suscripción (Broker → Frontend)**:
  - `medibox/<device_id>/event` - Eventos en tiempo real
  - `medibox/<device_id>/alert` - Alertas en tiempo real

## 🗄️ Base de Datos (SQLite)

### Tabla: users
- `id` - ID único
- `username` - Nombre de usuario
- `email` - Email
- `password` - Contraseña hasheada
- `device_id` - ID del dispositivo ESP32
- `created_at` - Fecha de creación

### Tabla: events
- `id` - ID único
- `device_id` - ID del dispositivo
- `pill_removed` - Píldora removida (boolean)
- `weight` - Peso actual (float)
- `weight_diff` - Diferencia de peso (float)
- `timestamp` - Timestamp del evento
- `created_at` - Fecha de creación

### Tabla: alerts
- `id` - ID único
- `device_id` - ID del dispositivo
- `message` - Mensaje de alerta
- `sent` - Enviado (boolean)
- `created_at` - Fecha de creación

## 🔌 API Endpoints

### Autenticación
- `POST /api/register` - Registrar usuario
- `POST /api/login` - Iniciar sesión

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/stats` - Estadísticas

### Alertas
- `POST /api/alert` - Enviar alerta

## 🔧 Tecnologías

### Firmware
- PlatformIO
- Arduino Framework
- ESP32
- PubSubClient (MQTT)
- ArduinoJson

### Backend
- Node.js
- Express
- SQLite3
- MQTT.js
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React
- TailwindCSS
- Chart.js
- React-Chartjs-2
- MQTT.js (WebSocket)
- Axios
- React Router

## 📝 Notas

- El firmware incluye simulación de sensores para pruebas
- El backend maneja autenticación JWT
- El frontend usa WebSocket para MQTT en tiempo real
- La base de datos se crea automáticamente al iniciar el backend
- Los eventos se almacenan en SQLite y se sincronizan en tiempo real vía MQTT

