// Check database schema
const db = require('../backend/database/db');

console.log('🔍 CHECKING DATABASE SCHEMA...\n');

// Check users table schema
db.all("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('❌ Error checking users table:', err);
  } else {
    console.log('👤 USERS TABLE SCHEMA:');
    rows.forEach(row => {
      console.log(`   ${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULLABLE'} ${row.pk ? '- PRIMARY KEY' : ''}`);
    });
  }
  
  // Check if table exists and has data
  db.all("SELECT COUNT(*) as count FROM users", (err, result) => {
    if (err) {
      console.error('❌ Error counting users:', err);
    } else {
      console.log(`   📊 Total users: ${result[0].count}\n`);
    }
    
    // Check badges table
    db.all("PRAGMA table_info(badges)", (err, rows) => {
      if (err) {
        console.error('❌ Error checking badges table:', err);
      } else {
        console.log('🏆 BADGES TABLE SCHEMA:');
        rows.forEach(row => {
          console.log(`   ${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULLABLE'} ${row.pk ? '- PRIMARY KEY' : ''}`);
        });
      }
      
      // Check user_badges table
      db.all("PRAGMA table_info(user_badges)", (err, rows) => {
        if (err) {
          console.error('❌ Error checking user_badges table:', err);
        } else {
          console.log('\n🎖️ USER_BADGES TABLE SCHEMA:');
          rows.forEach(row => {
            console.log(`   ${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULLABLE'} ${row.pk ? '- PRIMARY KEY' : ''}`);
          });
        }
        
        // Check sample user data
        db.all("SELECT * FROM users LIMIT 2", (err, users) => {
          if (err) {
            console.error('❌ Error getting sample users:', err);
          } else {
            console.log('\n👥 SAMPLE USERS:');
            users.forEach(user => {
              console.log(`   ID: ${user.id}, Columns: ${Object.keys(user).join(', ')}`);
            });
          }
          
          process.exit(0);
        });
      });
    });
  });
});