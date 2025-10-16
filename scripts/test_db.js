const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database/scisteps.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('Tables in database:', rows.map(r => r.name));
  }
  db.close();
});
