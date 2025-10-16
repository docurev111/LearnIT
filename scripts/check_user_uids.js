// Check user UIDs
const db = require('../backend/database/db');

db.all('SELECT uid, displayName, email FROM users WHERE displayName IN ("deanalcober", "Emma Wilson", "Sarah Kim", "David Lee")', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('User UIDs:');
    rows.forEach(row => {
      console.log(`${row.displayName}: UID=${row.uid}, Email=${row.email}`);
    });
  }
  db.close();
});