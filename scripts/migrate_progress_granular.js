// Add day_index and activity_index to progress table for granular tracking
const db = require('../backend/database/db');

console.log('🔄 Adding granular progress tracking columns...');

db.run(`ALTER TABLE progress ADD COLUMN day_index INTEGER DEFAULT NULL`, (err) => {
  if (err) {
    console.error('❌ Error adding day_index:', err);
  } else {
    console.log('✅ Added day_index column');
  }
  
  db.run(`ALTER TABLE progress ADD COLUMN activity_index INTEGER DEFAULT NULL`, (err) => {
    if (err) {
      console.error('❌ Error adding activity_index:', err);
    } else {
      console.log('✅ Added activity_index column');
    }
    
    db.run(`ALTER TABLE progress ADD COLUMN activity_type TEXT DEFAULT NULL`, (err) => {
      if (err) {
        console.error('❌ Error adding activity_type:', err);
      } else {
        console.log('✅ Added activity_type column');
      }
      
      console.log('🎉 Migration complete!');
      process.exit(0);
    });
  });
});