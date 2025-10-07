// Reset user progress and achievements for testing
const db = require('../src/database/db');

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID || this.changes);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function resetUserProgress() {
  console.log('🔄 RESETTING USER PROGRESS FOR TESTING...\n');

  try {
    // Get user info first
    const user = await getQuery('SELECT * FROM users WHERE displayName = ?', ['deanalcober']);
    
    if (!user) {
      console.log('❌ User "deanalcober" not found');
      return;
    }

    console.log(`👤 Resetting progress for user: ${user.displayName} (ID: ${user.id})`);
    
    // 1. Remove all user badges
    const badgesRemoved = await runQuery('DELETE FROM user_badges WHERE user_id = ?', [user.id]);
    console.log(`🏆 Removed ${badgesRemoved} badges`);
    
    // 2. Remove all lesson progress
    const progressRemoved = await runQuery('DELETE FROM progress WHERE user_id = ?', [user.id]);
    console.log(`📚 Removed ${progressRemoved} lesson completion records`);
    
    // 3. Reset XP and level (if these columns exist)
    try {
      const xpReset = await runQuery('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [user.id]);
      console.log(`⚡ Reset XP and level for user`);
    } catch (err) {
      console.log('⚠️  XP/level columns might not exist in users table');
    }
    
    // 4. Show current status
    console.log('\n📊 CURRENT STATUS AFTER RESET:');
    
    const currentBadges = await getQuery('SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?', [user.id]);
    console.log(`   🏆 User badges: ${currentBadges.count}`);
    
    const currentProgress = await getQuery('SELECT COUNT(*) as count FROM progress WHERE user_id = ?', [user.id]);
    console.log(`   📚 Lesson completions: ${currentProgress.count}`);
    
    const userInfo = await getQuery('SELECT * FROM users WHERE id = ?', [user.id]);
    console.log(`   ⚡ XP: ${userInfo.xp || 'N/A'}, Level: ${userInfo.level || 'N/A'}`);
    
    console.log('\n✅ RESET COMPLETE! You can now test earning badges again! 🎉');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }
}

// Run the reset
resetUserProgress().then(() => {
  console.log('\n🏁 Reset script completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Reset error:', err);
  process.exit(1);
});