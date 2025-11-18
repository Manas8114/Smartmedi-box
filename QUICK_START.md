# 🚀 Inicio Rápido - MediMind Pro

## Opción 1: Scripts Automáticos

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

## Opción 2: Manual

### 1. Iniciar MQTT Broker
```bash
mosquitto -v
```

### 2. Iniciar Backend
```bash
cd backend
npm install
npm start
```

### 3. Iniciar Frontend
```bash
cd web
npm install
npm start
```

## 📱 Configurar ESP32

1. **Obtener IP del Broker MQTT**:
   - Windows: `ipconfig` (buscar IPv4)
   - Linux/Mac: `ifconfig` o `ip addr`
   - Ejemplo: `192.168.1.100`

2. **Editar `firmware/esp32/src/main.cpp`**:
   ```cpp
   const char* ssid = "TU_WIFI_SSID";
   const char* password = "TU_WIFI_PASSWORD";
   const char* mqtt_server = "192.168.1.100";  // ← Tu IP aquí
   ```

3. **Compilar y subir**:
   ```bash
   cd firmware/esp32
   pio run -t upload
   pio device monitor
   ```

## 🔍 Verificar Instalación

### Backend
```bash
curl http://localhost:3000/health
# Debe responder: {"status":"ok","message":"MediMind Pro Backend"}
```

### MQTT
```bash
# Terminal 1: Suscribirse
mosquitto_sub -h localhost -t 'medibox/#' -v

# Terminal 2: Publicar prueba
mosquitto_pub -h localhost -t 'medibox/test/event' -m '{"test": true}'
```

### Frontend
1. Abrir http://localhost:3000
2. Registrar usuario con:
   - Usuario: `test`
   - Email: `test@example.com`
   - Password: `test123`
   - Device ID: `medibox_001` (debe coincidir con ESP32)

## ✅ Checklist

- [ ] MQTT Broker corriendo (puerto 1883)
- [ ] Backend corriendo (puerto 3000)
- [ ] Frontend corriendo (puerto 3000 React)
- [ ] ESP32 configurado y conectado
- [ ] Usuario registrado en el frontend
- [ ] Device ID coincide entre ESP32 y usuario

## 🐛 Problemas Comunes

### "Cannot connect to MQTT"
- Verificar que Mosquitto esté corriendo
- Verificar IP del broker en ESP32
- Verificar firewall (puerto 1883)

### "Backend no recibe eventos"
- Verificar logs del backend
- Verificar conexión ESP32 al broker
- Verificar topic: `medibox/<device_id>/event`

### "Frontend no muestra datos"
- Verificar consola del navegador (F12)
- Verificar que el backend esté corriendo
- Verificar token de autenticación

## 📚 Documentación Completa

Ver `README.md` y `SETUP.md` para más detalles.

