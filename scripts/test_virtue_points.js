// Test Virtue Points implementation
const db = require('../backend/database/db');

console.log('🧪 TESTING VIRTUE POINTS IMPLEMENTATION...\n');

db.get('SELECT virtue_points FROM xp LIMIT 1', (err, row) => {
  if (err) {
    console.error('❌ Error checking virtue_points column:', err);
  } else {
    console.log('✅ Virtue Points column exists in database');
    console.log('📊 Sample virtue_points value:', row ? row.virtue_points : 'No data yet');
  }
  db.close();
});