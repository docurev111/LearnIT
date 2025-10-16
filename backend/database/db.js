const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'scisteps.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Enable WAL mode for better concurrency
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');

module.exports = db;