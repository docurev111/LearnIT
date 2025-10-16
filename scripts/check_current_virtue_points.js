// Check current Virtue Points in database
const db = require('../backend/database/db');

db.all('SELECT u.displayName, x.virtue_points, x.total_xp FROM users u LEFT JOIN xp x ON u.id = x.user_id WHERE u.displayName IN ("deanalcober", "Emma Wilson", "Sarah Kim", "David Lee")', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Current database values:');
    rows.forEach(row => {
      console.log(`${row.displayName}: ${row.virtue_points || 0} Virtue Points, ${row.total_xp || 0} XP`);
    });
  }
  db.close();
});