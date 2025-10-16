// Verify weekly calculation for Emma Wilson
const db = require('../backend/database/db');

db.get('SELECT x.total_xp FROM users u LEFT JOIN xp x ON u.id = x.user_id WHERE u.displayName = "Emma Wilson"', (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else {
    const xp = row ? row.total_xp || 0 : 0;
    const weekly = Math.floor(xp * 0.3);
    console.log(`Emma Wilson: ${xp} XP -> ${weekly} weekly Virtue Points`);
    console.log(`Formula: Math.floor(${xp} * 0.3) = ${weekly}`);
  }
  db.close();
});