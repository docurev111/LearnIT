// Check current users in database
const db = require('../src/database/db');

console.log('👥 CHECKING CURRENT USERS IN DATABASE...\n');

db.all("SELECT * FROM users", (err, users) => {
  if (err) {
    console.error('❌ Error getting users:', err);
    process.exit(1);
  }
  
  console.log(`Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`   🧑 ID: ${user.id}, UID: ${user.uid}, Name: ${user.displayName}, Email: ${user.email}`);
  });
  
  // Also check user badges
  db.all(`
    SELECT ub.*, b.name as badge_name, u.displayName 
    FROM user_badges ub 
    JOIN badges b ON ub.badge_id = b.id 
    JOIN users u ON ub.user_id = u.id
  `, (err, badges) => {
    if (err) {
      console.error('❌ Error getting user badges:', err);
    } else {
      console.log(`\n🏆 Found ${badges.length} user badges:`);
      badges.forEach(badge => {
        console.log(`   🎖️ ${badge.displayName} earned "${badge.badge_name}" on ${badge.earned_at}`);
      });
    }
    
    // Check progress records
    db.all(`
      SELECT p.*, u.displayName 
      FROM progress p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.completed_at DESC 
      LIMIT 10
    `, (err, progress) => {
      if (err) {
        console.error('❌ Error getting progress:', err);
      } else {
        console.log(`\n📚 Found ${progress.length} recent progress records:`);
        progress.forEach(prog => {
          console.log(`   📖 ${prog.displayName} completed lesson ${prog.lesson_id} (score: ${prog.score}) on ${prog.completed_at}`);
        });
      }
      
      process.exit(0);
    });
  });
});