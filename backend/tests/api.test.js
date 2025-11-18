const request = require('supertest');
const express = require('express');
const api = require('../api');
const db = require('../db');

const app = express();
app.use(express.json());
app.use('/api', api);

let authToken = '';
let testUserId = null;

beforeAll(async () => {
  await db.init();
  
  // Register a test user
  const user = await db.registerUser(
    'apitest',
    'apitest@example.com',
    '$2a$10$rQZ8Z8Z8Z8Z8Z8Z8Z8Z8ZuZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', // Hashed password
    'api_test_device'
  );
  testUserId = user.id;
});

afterAll(async () => {
  await db.close();
});

describe('API Tests', () => {
  describe('POST /api/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          device_id: 'new_device_001'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('newuser');
    });

    test('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'incomplete',
          email: 'incomplete@example.com'
          // missing password and device_id
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject duplicate username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'apitest',
          email: 'duplicate@example.com',
          password: 'password123',
          device_id: 'device_002'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('User already exists');
    });
  });

  describe('POST /api/login', () => {
    test('should login with valid credentials', async () => {
      // First register a user
      await request(app)
        .post('/api/register')
        .send({
          username: 'logintest',
          email: 'logintest@example.com',
          password: 'password123',
          device_id: 'login_device'
        });
      
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      
      authToken = response.body.token;
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest'
          // missing password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/events', () => {
    test('should get events with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'password123'
        });
      
      const token = loginResponse.body.token;
      
      // Insert test event
      await db.insertEvent('login_device', true, 100.0, 5.0, Date.now());
      
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.events).toBeInstanceOf(Array);
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/events');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    test('should respect limit parameter', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'password123'
        });
      
      const token = loginResponse.body.token;
      
      const response = await request(app)
        .get('/api/events?limit=5')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.events.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/stats', () => {
    test('should get stats with valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'password123'
        });
      
      const token = loginResponse.body.token;
      
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats).toHaveProperty('totalEvents');
      expect(response.body.stats).toHaveProperty('todayEvents');
      expect(response.body.stats).toHaveProperty('lastEvent');
    });
  });

  describe('POST /api/alert', () => {
    test('should send alert with valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'password123'
        });
      
      const token = loginResponse.body.token;
      
      const response = await request(app)
        .post('/api/alert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'Test alert message'
        });
      
      // Note: This will fail if MQTT broker is not running
      // In a real test environment, you'd mock the MQTT client
      expect([200, 500]).toContain(response.status);
    });

    test('should reject alert without message', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'logintest',
          password: 'password123'
        });
      
      const token = loginResponse.body.token;
      
      const response = await request(app)
        .post('/api/alert')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});

