// Check all users with Virtue Points
const db = require('../backend/database/db');

db.all('SELECT u.displayName, x.virtue_points FROM users u LEFT JOIN xp x ON u.id = x.user_id WHERE x.virtue_points > 0 ORDER BY x.virtue_points DESC', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('All users with Virtue Points:');
    rows.forEach(row => {
      console.log(`${row.displayName}: ${row.virtue_points} Virtue Points`);
    });
  }
  db.close();
});