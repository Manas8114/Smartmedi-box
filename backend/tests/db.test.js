const db = require('../db');
const path = require('path');
const fs = require('fs');

// Clean up test database before and after tests
beforeAll(async () => {
  // Initialize database (will use test DB path from setup.js)
  await db.init();
});

afterAll(async () => {
  // Close database connection
  await db.close();
  
  // Remove test database
  const TEST_DB_PATH = process.env.DB_PATH || path.join(__dirname, '../medimind.test.db');
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch (err) {
      // Ignore errors if file is locked
      console.warn('Could not delete test database:', err.message);
    }
  }
});

describe('Database Tests', () => {
  describe('User Operations', () => {
    test('should register a new user', async () => {
      const user = await db.registerUser(
        'testuser',
        'test@example.com',
        'hashedpassword',
        'test_device_001'
      );
      
      expect(user).toHaveProperty('id');
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.deviceId).toBe('test_device_001');
    });

    test('should not register duplicate username', async () => {
      await expect(
        db.registerUser('testuser', 'test2@example.com', 'password', 'device002')
      ).rejects.toThrow();
    });

    test('should get user by username', async () => {
      const user = await db.getUserByUsername('testuser');
      
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    test('should get user by device ID', async () => {
      const user = await db.getUserByDeviceId('test_device_001');
      
      expect(user).toBeDefined();
      expect(user.device_id).toBe('test_device_001');
    });

    test('should return null for non-existent user', async () => {
      const user = await db.getUserByUsername('nonexistent');
      expect(user).toBeUndefined();
    });
  });

  describe('Event Operations', () => {
    test('should insert an event', async () => {
      const eventId = await db.insertEvent(
        'test_device_001',
        true,
        95.5,
        5.0,
        Date.now()
      );
      
      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('number');
    });

    test('should get events for a device', async () => {
      // Insert multiple events
      await db.insertEvent('test_device_001', true, 90.0, 5.5, Date.now());
      await db.insertEvent('test_device_001', true, 85.0, 5.0, Date.now());
      
      const events = await db.getEvents('test_device_001', 10);
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('device_id');
      expect(events[0]).toHaveProperty('pill_removed');
      expect(events[0]).toHaveProperty('weight');
    });

    test('should get all events with limit', async () => {
      const events = await db.getAllEvents(5);
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeLessThanOrEqual(5);
    });

    test('should handle null database gracefully', async () => {
      await db.close();
      await expect(
        db.insertEvent('test', true, 100, 5, Date.now())
      ).rejects.toThrow('Database not initialized');
      
      // Reinitialize for other tests
      await db.init();
    });
  });

  describe('Alert Operations', () => {
    test('should insert an alert', async () => {
      const alertId = await db.insertAlert('test_device_001', 'Test alert message');
      
      expect(alertId).toBeDefined();
      expect(typeof alertId).toBe('number');
    });
  });
});

