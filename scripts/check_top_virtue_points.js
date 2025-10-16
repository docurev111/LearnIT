// Check top users by Virtue Points
const db = require('../backend/database/db');

db.all('SELECT u.displayName, x.virtue_points FROM users u LEFT JOIN xp x ON u.id = x.user_id ORDER BY x.virtue_points DESC LIMIT 10', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Top 10 users by Virtue Points:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.displayName}: ${row.virtue_points || 0} Virtue Points`);
    });
  }
  db.close();
});