/**
 * Test helpers and utilities
 */

/**
 * Create a test user in the database
 */
async function createTestUser(db, username = 'testuser', deviceId = 'test_device') {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  return await db.registerUser(
    username,
    `${username}@example.com`,
    hashedPassword,
    deviceId
  );
}

/**
 * Generate a test JWT token
 */
function generateTestToken(userId, username, deviceId) {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_jwt';
  
  return jwt.sign(
    { id: userId, username, deviceId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Wait for a specified amount of time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean up test database
 */
async function cleanupTestDatabase(db) {
  const dbConn = db.getConnection();
  
  return new Promise((resolve, reject) => {
    dbConn.serialize(() => {
      dbConn.run('DELETE FROM events', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        dbConn.run('DELETE FROM alerts', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          dbConn.run('DELETE FROM users', (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      });
    });
  });
}

module.exports = {
  createTestUser,
  generateTestToken,
  wait,
  cleanupTestDatabase
};

