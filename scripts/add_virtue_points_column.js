// Add virtue_points column to xp table
const db = require('../backend/database/db');

console.log('🔄 ADDING VIRTUE POINTS COLUMN TO XP TABLE...\n');

db.run('ALTER TABLE xp ADD COLUMN virtue_points INTEGER DEFAULT 0', (err) => {
  if (err) {
    console.error('❌ Error adding virtue_points column:', err);
  } else {
    console.log('✅ Successfully added virtue_points column to xp table');
  }
  
  // Update existing records to have 0 virtue points
  db.run('UPDATE xp SET virtue_points = 0 WHERE virtue_points IS NULL', (updateErr) => {
    if (updateErr) {
      console.error('❌ Error updating existing records:', updateErr);
    } else {
      console.log('✅ Successfully initialized virtue_points for existing users');
    }
    db.close();
  });
});