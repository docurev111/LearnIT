// src/database/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db_name = path.resolve(dbDir, 'scisteps.db');

const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    console.error('Database opening error: ', err);
  } else {
    console.log('Database connected at', db_name);
    // Apply recommended pragmas
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA foreign_keys = ON;');
  }
});

module.exports = db;
