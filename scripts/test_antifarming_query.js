// Test the anti-farming query manually
const db = require('../src/database/db');

function getQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function testAntiFarmingQuery() {
  console.log('🔍 Testing anti-farming query...\n');

  try {
    // Test the exact query used in the server
    const existingProgress = await getQuery(
      'SELECT * FROM progress WHERE user_id = ? AND lesson_id = ? AND completed = 1', 
      [11, 1]
    );

    console.log('📋 Query result:', existingProgress);

    if (existingProgress) {
      console.log('✅ Found existing progress - anti-farming should work');
      console.log('   📅 Completed at:', existingProgress.completed_at);
      console.log('   📊 Score:', existingProgress.score);
    } else {
      console.log('❌ No existing progress found - query might be wrong');
    }

    // Also check all progress records for this user
    console.log('\n📚 All progress records for user 11:');
    db.all('SELECT * FROM progress WHERE user_id = 11', (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        rows.forEach((row, index) => {
          console.log(`   ${index + 1}. Lesson ${row.lesson_id}, Completed: ${row.completed}, Score: ${row.score}, Date: ${row.completed_at}`);
        });
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAntiFarmingQuery();