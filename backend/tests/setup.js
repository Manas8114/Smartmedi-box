// Test setup file
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MQTT_BROKER = 'mqtt://localhost:1884'; // Use different port for testing
process.env.JWT_SECRET = 'test_secret_key_for_jwt';

// Override database path for testing
const path = require('path');
process.env.DB_PATH = path.join(__dirname, '../medimind.test.db');

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

