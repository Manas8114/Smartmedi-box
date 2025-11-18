const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const mqtt = require('./mqtt');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medimind_secret_key_change_in_production';

// Helper function to promisify db.get
function dbGet(query, params) {
  return new Promise((resolve, reject) => {
    const dbConn = db.getConnection();
    if (!dbConn) {
      reject(new Error('Database not initialized'));
      return;
    }
    dbConn.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// POST /api/register - Register user/device
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, device_id } = req.body;

    if (!username || !email || !password || !device_id) {
      return res.status(400).json({ 
        error: 'All fields are required: username, email, password, device_id' 
      });
    }

    // Check if user already exists
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register user
    const user = await db.registerUser(username, email, hashedPassword, device_id);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, deviceId: device_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        deviceId: user.deviceId
      },
      token
    });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// POST /api/login - Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, deviceId: user.device_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        deviceId: user.device_id
      },
      token
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// GET /api/events - List pill events
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.query.device_id || req.user.deviceId;
    // Validate and parse limit, ensure it's a positive number
    const limitInput = parseInt(req.query.limit, 10);
    const limit = (isNaN(limitInput) || limitInput <= 0 || limitInput > 1000) ? 100 : limitInput;

    let events;
    if (deviceId) {
      events = await db.getEvents(deviceId, limit);
    } else {
      events = await db.getAllEvents(limit);
    }

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Error getting events' });
  }
});

// POST /api/alert - Send alert (publishes via MQTT)
router.post('/alert', authenticateToken, async (req, res) => {
  try {
    const { device_id, message } = req.body;
    const targetDeviceId = device_id || req.user.deviceId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!targetDeviceId) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    // Publish alert via MQTT
    await mqtt.publishAlert(targetDeviceId, message);

    res.json({
      success: true,
      message: 'Alert sent successfully',
      deviceId: targetDeviceId
    });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ error: 'Error sending alert' });
  }
});

// GET /api/stats - Device statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.query.device_id || req.user.deviceId;
    if (!deviceId) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    // Optimize: Use SQL to get stats instead of fetching all events
    const [totalRow, todayRow, lastEvent] = await Promise.all([
      dbGet('SELECT COUNT(*) as total FROM events WHERE device_id = ?', [deviceId]),
      dbGet("SELECT COUNT(*) as today FROM events WHERE device_id = ? AND DATE(created_at) = DATE('now')", [deviceId]),
      dbGet('SELECT * FROM events WHERE device_id = ? ORDER BY created_at DESC LIMIT 1', [deviceId])
    ]);

    const stats = {
      totalEvents: totalRow?.total || 0,
      todayEvents: todayRow?.today || 0,
      lastEvent: lastEvent || null
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Error getting statistics' });
  }
});

module.exports = router;

