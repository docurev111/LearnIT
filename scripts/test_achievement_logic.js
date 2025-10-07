// Simple test to check if achievements are working
const db = require('../src/database/db');
const achievementController = require('../src/controllers/achievementController');

async function testAchievementSystem() {
  console.log('🧪 TESTING ACHIEVEMENT SYSTEM...\n');

  try {
    // Test 1: Check if badges exist in database
    console.log('1️⃣ Checking badges in database...');
    
    const badges = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM badges LIMIT 5', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`✅ Found ${badges.length} badges in database`);
    badges.forEach(badge => {
      console.log(`   🏆 ${badge.name} (${badge.rarity})`);
    });

    // Test 2: Check if we can create a test user
    console.log('\n2️⃣ Creating test user...');
    
    const testUserId = await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (firebase_uid, display_name, email) VALUES (?, ?, ?)', 
        ['test-uid-123', 'Test User', 'test@example.com'], 
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    console.log(`✅ Created test user with ID: ${testUserId}`);

    // Test 3: Test achievement checking
    console.log('\n3️⃣ Testing achievement checking...');
    
    const newAchievements = await achievementController.checkAndAwardAchievements(
      testUserId,
      'lesson_completion',
      { lesson_id: 1, completed: true }
    );
    
    console.log(`✅ Achievement check completed. Awarded ${newAchievements.length} badges:`);
    newAchievements.forEach(achievement => {
      console.log(`   🎉 ${achievement.name} - ${achievement.description}`);
    });

    // Test 4: Check user badges
    console.log('\n4️⃣ Checking user badges...');
    
    const userBadges = await new Promise((resolve, reject) => {
      db.all('SELECT ub.*, b.name, b.description FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ?', 
        [testUserId], 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    console.log(`✅ User has ${userBadges.length} badges:`);
    userBadges.forEach(badge => {
      console.log(`   🏆 ${badge.name} - ${badge.description}`);
    });

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM user_badges WHERE user_id = ?', [testUserId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [testUserId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAchievementSystem().then(() => {
  console.log('\n✅ Achievement system test completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test error:', err);
  process.exit(1);
});