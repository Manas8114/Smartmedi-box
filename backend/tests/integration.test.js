const request = require('supertest');
const express = require('express');
const api = require('../api');
const db = require('../db');
const mqtt = require('../mqtt');

const app = express();
app.use(express.json());
app.use('/api', api);

describe('Integration Tests', () => {
  let authToken = '';
  let deviceId = 'integration_test_device';

  beforeAll(async () => {
    await db.init();
    
    // Register test user
    await request(app)
      .post('/api/register')
      .send({
        username: 'integrationtest',
        email: 'integration@example.com',
        password: 'password123',
        device_id: deviceId
      });
    
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'integrationtest',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await mqtt.close();
    await db.close();
  });

  test('should complete full user flow', async () => {
    // 1. Register user
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        username: 'fullflow',
        email: 'fullflow@example.com',
        password: 'password123',
        device_id: 'fullflow_device'
      });
    
    expect(registerResponse.status).toBe(200);
    const userToken = registerResponse.body.token;
    
    // 2. Login
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'fullflow',
        password: 'password123'
      });
    
    expect(loginResponse.status).toBe(200);
    
    // 3. Insert event via database
    await db.insertEvent('fullflow_device', true, 100.0, 5.0, Date.now());
    
    // 4. Get events
    const eventsResponse = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(eventsResponse.status).toBe(200);
    expect(eventsResponse.body.events.length).toBeGreaterThan(0);
    
    // 5. Get stats
    const statsResponse = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(statsResponse.status).toBe(200);
    expect(statsResponse.body.stats.totalEvents).toBeGreaterThan(0);
  });

  test('should handle event creation and retrieval', async () => {
    // Insert multiple events
    await db.insertEvent(deviceId, true, 95.0, 5.0, Date.now());
    await db.insertEvent(deviceId, true, 90.0, 5.0, Date.now());
    await db.insertEvent(deviceId, true, 85.0, 5.0, Date.now());
    
    // Retrieve events
    const response = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.events.length).toBeGreaterThanOrEqual(3);
    
    // Verify event structure
    const event = response.body.events[0];
    expect(event).toHaveProperty('device_id');
    expect(event).toHaveProperty('pill_removed');
    expect(event).toHaveProperty('weight');
    expect(event).toHaveProperty('weight_diff');
  });

  test('should handle stats calculation correctly', async () => {
    // Insert events for today
    const today = new Date();
    await db.insertEvent(deviceId, true, 100.0, 5.0, today.getTime());
    
    // Get stats
    const response = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.stats).toHaveProperty('totalEvents');
    expect(response.body.stats).toHaveProperty('todayEvents');
    expect(response.body.stats).toHaveProperty('lastEvent');
    expect(response.body.stats.totalEvents).toBeGreaterThan(0);
  });

  test('should handle authentication flow', async () => {
    // Test protected endpoint without token
    const noAuthResponse = await request(app)
      .get('/api/events');
    
    expect(noAuthResponse.status).toBe(401);
    
    // Test protected endpoint with invalid token
    const invalidTokenResponse = await request(app)
      .get('/api/events')
      .set('Authorization', 'Bearer invalid_token_here');
    
    expect(invalidTokenResponse.status).toBe(403);
    
    // Test protected endpoint with valid token
    const validTokenResponse = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(validTokenResponse.status).toBe(200);
  });
});

