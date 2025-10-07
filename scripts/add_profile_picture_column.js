// Add profile_picture column to users table
const db = require('../src/database/db');

console.log('🖼️ ADDING PROFILE PICTURE SUPPORT TO DATABASE...\n');

// Add profile_picture column to users table
db.run('ALTER TABLE users ADD COLUMN profile_picture TEXT', (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✅ Profile picture column already exists');
    } else {
      console.error('❌ Error adding profile_picture column:', err);
    }
  } else {
    console.log('✅ Successfully added profile_picture column to users table');
  }
  
  // Check the updated table structure
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking table structure:', err);
    } else {
      console.log('\n👤 UPDATED USERS TABLE STRUCTURE:');
      columns.forEach(col => {
        console.log(`   📝 ${col.name} (${col.type})`);
      });
    }
    
    process.exit(0);
  });
});