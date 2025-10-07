// scripts/list_lessons.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'src', 'database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all('SELECT id, unit_id, title FROM lessons ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      console.error('Error listing lessons:', err);
      process.exit(1);
    }
    console.log('Lessons:');
    rows.forEach(r => console.log(r));
    if (rows.length === 0) console.log('(no lessons found)');
    db.close();
  });
});
