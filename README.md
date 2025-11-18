Here’s the **fully translated and polished English version** of your documentation — formatted cleanly for GitHub (Markdown-ready).
All technical terms are kept accurate, and phrasing is natural for professional English README files.

---

# 💊 MediMind Pro – Smart Medicine Box 2.0

A **real-time medication management system** built with **IoT, AI, and a web dashboard**.

---

## 🎯 Features

* **Pill detection** using load cell and IR sensors
* **Real-time MQTT communication** between ESP32 and backend
* **Web dashboard** built with React and TailwindCSS
* **Local SQLite database** for lightweight storage
* **JWT authentication** for secure access
* **Real-time alerts** via MQTT
* **Live charts** for medicine event visualization

---

## 🏗️ Architecture

```
ESP32 (Firmware)
    ↓ MQTT
Backend: Node.js (Express + MQTT + SQLite)
    ↓ REST API
Frontend: React (Dashboard)
```

---

## 📋 Requirements

### Hardware

* ESP32 DevKit
* Load Cell (HX711 + Sensor) or simulated input
* IR Sensor (optional)
* WiFi connection

### Software

* Node.js 16+
* npm or yarn
* PlatformIO (for ESP32 firmware)
* Mosquitto MQTT Broker (local or remote)
* Python 3.8+ (for PlatformIO support)

---

## 🚀 Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings

# Frontend
cd ../web
npm install
```

---

### 2. Configure MQTT Broker (Mosquitto)

#### Windows

```bash
# Download and install: https://mosquitto.org/download/
# or via Chocolatey:
choco install mosquitto

# Start broker (usually runs as a service)
# or manually:
mosquitto -c mosquitto.conf
```

#### Linux/Mac

```bash
# Install
sudo apt-get install mosquitto mosquitto-clients  # Ubuntu/Debian
brew install mosquitto  # Mac

# Start broker
mosquitto -c /etc/mosquitto/mosquitto.conf
```

#### Basic Configuration (`mosquitto.conf`)

```conf
listener 1883
allow_anonymous true
```

---

### 3. Configure Backend

Edit `backend/.env`:

```env
PORT=3000
MQTT_BROKER=mqtt://localhost:1883
JWT_SECRET=your_jwt_secret_here
```

Start the backend:

```bash
cd backend
npm start
```

---

### 4. Configure Frontend

Create `web/.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_MQTT_BROKER=ws://localhost:9001
```

> **Note:** For MQTT WebSocket communication, enable WebSocket support in Mosquitto:
>
> ```conf
> listener 9001
> protocol websockets
> ```

Start the frontend:

```bash
cd web
npm start
```

---

### 5. Configure ESP32 Firmware

1. Install PlatformIO (VS Code extension or CLI).
2. Edit `firmware/esp32/src/main.cpp`:

   * Set `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD`
   * Update `mqtt_server` to your MQTT broker IP
   * Adjust `device_id` if needed
3. Build and upload:

```bash
cd firmware/esp32
pio run -t upload
pio device monitor
```

---

## 📁 Project Structure

```
medimind-pro/
├── firmware/
│   └── esp32/
│       ├── platformio.ini
│       └── src/
│           ├── main.cpp
│           ├── sensors.cpp
│           ├── sensors.h
│           ├── wifi_mqtt.cpp
│           └── wifi_mqtt.h
├── backend/
│   ├── index.js
│   ├── db.js
│   ├── mqtt.js
│   ├── api.js
│   ├── package.json
│   └── .env.example
├── web/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── AlertButton.jsx
│   │   │   └── RealTimeChart.jsx
│   │   └── services/
│   │       ├── api.js
│   │       ├── AuthService.js
│   │       └── mqttService.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🔧 Usage

### 1. Start Services

```bash
# Terminal 1: MQTT Broker
mosquitto -c mosquitto.conf

# Terminal 2: Backend
cd backend
npm start

# Terminal 3: Frontend
cd web
npm start
```

### 2. Register a User

1. Open `http://localhost:3000`
2. Register with:

   * Username
   * Email
   * Password
   * Device ID (must match ESP32 `device_id`)

### 3. Connect ESP32

1. Ensure ESP32 is connected to WiFi
2. Verify it connects to MQTT broker
3. Pill events will be published automatically

### 4. View Real-Time Events

* Dashboard displays real-time pill events
* Charts auto-update
* Alerts can be sent manually from the “Send Alert” button

---

## 🔌 API Endpoints

### Authentication

* `POST /api/register` — Register a new user
* `POST /api/login` — Log in

### Events

* `GET /api/events` — List all events (requires auth)
* `GET /api/stats` — Retrieve event statistics (requires auth)

### Alerts

* `POST /api/alert` — Send alert (requires auth)

---

## 📡 MQTT Topics

| Topic                       | Description                      |
| --------------------------- | -------------------------------- |
| `medibox/<device_id>/event` | Pill events (published by ESP32) |
| `medibox/<device_id>/alert` | Alerts (subscribed by ESP32)     |

---

## 🔐 Security

* JWT authentication for all protected routes
* Passwords hashed with bcrypt
* CORS configured for frontend
* Input validation on all backend routes

---

## 🐛 Troubleshooting

### ESP32 fails to connect to WiFi

* Check WiFi credentials in `main.cpp`
* Ensure the WiFi network is **2.4GHz** (ESP32 doesn’t support 5GHz)

### MQTT not connecting

* Verify Mosquitto is running
* Check broker IP in `main.cpp`
* Confirm port 1883 is open

### Backend not receiving events

* Ensure MQTT broker is active
* Check ESP32 connectivity
* View backend logs for errors

### Frontend not connecting to MQTT

* Confirm WebSocket is enabled in Mosquitto
* Verify `REACT_APP_MQTT_BROKER` in `.env`
* Ensure port `9001` is open

---

## 🚧 Upcoming Enhancements

* [ ] TensorFlow Lite Micro integration for pill recognition
* [ ] Push notifications
* [ ] Medication history view
* [ ] Reminder scheduling
* [ ] Multi-device support
* [ ] Mobile-friendly dashboard
* [ ] Data export (CSV/PDF)
* [ ] Integration with health APIs

---

## 📝 License

**MIT License**

---

## 👥 Contributions

Contributions are welcome!
Please open an issue or pull request in the repository.

---

#
