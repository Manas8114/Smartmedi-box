const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'medimind.db');

let db = null;

function init() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('📦 Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        device_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Events table (pills)
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        pill_removed BOOLEAN NOT NULL,
        weight REAL,
        weight_diff REAL,
        timestamp INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES users(device_id)
      )`,
      
      // Alerts table
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        message TEXT NOT NULL,
        sent BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    queries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === queries.length) {
          console.log('✅ Tables created/verified');
          resolve();
        }
      });
    });
  });
}

function insertEvent(deviceId, pillRemoved, weight, weightDiff, timestamp) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    const query = `INSERT INTO events (device_id, pill_removed, weight, weight_diff, timestamp)
                   VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [deviceId, pillRemoved ? 1 : 0, weight, weightDiff, timestamp], function(err) {
      if (err) {
        console.error('Error inserting event:', err);
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}

function getEvents(deviceId, limit = 100) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    let query = `SELECT * FROM events WHERE device_id = ? ORDER BY created_at DESC LIMIT ?`;
    db.all(query, [deviceId, limit], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getAllEvents(limit = 100) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    const query = `SELECT * FROM events ORDER BY created_at DESC LIMIT ?`;
    db.all(query, [limit], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function registerUser(username, email, password, deviceId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    const query = `INSERT INTO users (username, email, password, device_id)
                   VALUES (?, ?, ?, ?)`;
    db.run(query, [username, email, password, deviceId], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, username, email, deviceId });
    });
  });
}

function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function getUserByDeviceId(deviceId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    const query = `SELECT * FROM users WHERE device_id = ?`;
    db.get(query, [deviceId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function insertAlert(deviceId, message) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    const query = `INSERT INTO alerts (device_id, message) VALUES (?, ?)`;
    db.run(query, [deviceId, message], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}

function getConnection() {
  return db;
}

function close() {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
        return;
      }
      console.log('✅ Database closed');
      db = null;
      resolve();
    });
  });
}

module.exports = {
  init,
  insertEvent,
  getEvents,
  getAllEvents,
  registerUser,
  getUserByUsername,
  getUserByDeviceId,
  insertAlert,
  getConnection,
  close
};

