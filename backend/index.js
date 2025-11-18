require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const mqttHandler = require('./mqtt');
const api = require('./api');

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize application
async function startServer() {
  try {
    // Initialize database
    await db.init();
    
    // Initialize MQTT
    mqttHandler.init();
    
    // API routes
    app.use('/api', api);
    
    // Health route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'MediMind Pro Backend' });
    });
    
    // Start server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 MQTT Broker: ${process.env.MQTT_BROKER || 'mqtt://localhost:1883'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer().then(() => {
  // Server started successfully
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Closing server gracefully...`);
  
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
  }
  
  try {
    // Close MQTT connection
    await mqttHandler.close();
    
    // Close database connection
    await db.close();
    
    console.log('✅ All resources released');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit immediately - allow graceful shutdown
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Log but don't crash - some rejections are expected
});

