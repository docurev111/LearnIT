// Test leaderboard API with Virtue Points
const db = require('../backend/database/db');
const challengeController = require('../backend/controllers/challengeController');

async function testLeaderboard() {
  try {
    console.log('🧪 TESTING LEADERBOARD API WITH VIRTUE POINTS...\n');

    // Get a class ID from the database
    const classes = await new Promise((resolve, reject) => {
      db.all('SELECT DISTINCT class_id FROM users WHERE class_id IS NOT NULL LIMIT 1', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (classes.length === 0) {
      console.log('❌ No classes found in database');
      return;
    }

    const classId = classes[0].class_id;
    console.log(`📚 Testing with class ID: ${classId}`);

    // Get leaderboard data
    const leaderboard = await challengeController.getClassLeaderboard(classId);

    console.log(`\n🏆 LEADERBOARD RESULTS (${leaderboard.length} students):`);
    leaderboard.forEach((student, index) => {
      console.log(`${index + 1}. ${student.displayName}: ${student.virtue_points || 0} Virtue Points, ${student.total_xp || 0} XP`);
    });

    console.log('\n✅ Leaderboard API test completed successfully!');

  } catch (err) {
    console.error('❌ Error testing leaderboard:', err);
  } finally {
    db.close();
  }
}

testLeaderboard();