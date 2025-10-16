const db = require('../backend/database/db');

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Tables:');
  tables.forEach(t => console.log(' -', t.name));
  
  db.all('PRAGMA table_info(progress)', (err, cols) => {
    if (err) {
      console.error('Progress table error:', err);
      process.exit(1);
    }
    console.log('Progress table columns:');
    cols.forEach(c => console.log('  ', c.name, c.type));
    process.exit(0);
  });
});