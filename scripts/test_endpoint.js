// Test the complete-lesson endpoint directly 
const fetch = require('node-fetch');
const Firebase = require('firebase-admin');

async function testCompleteLessonEndpoint() {
  console.log('🧪 TESTING /complete-lesson ENDPOINT...\n');

  try {
    // Test without authentication first (should fail)
    console.log('1️⃣ Testing without authentication...');
    const noAuthRes = await fetch('http://localhost:3000/complete-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 11, lesson_id: 2 })
    });
    
    console.log(`Response: ${noAuthRes.status} - ${await noAuthRes.text()}\n`);
    
    // Test with Bearer DEV token (should work for testing)
    console.log('2️⃣ Testing with DEV token...');
    const devAuthRes = await fetch('http://localhost:3000/complete-lesson', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer DEV',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ user_id: 11, lesson_id: 2 })
    });
    
    if (devAuthRes.ok) {
      const result = await devAuthRes.json();
      console.log('✅ Success! Response:', JSON.stringify(result, null, 2));
    } else {
      console.log(`❌ Failed: ${devAuthRes.status} - ${await devAuthRes.text()}`);
    }
    
    // Check if user now has more badges
    console.log('\n3️⃣ Checking user badges after completion...');
    const achievementController = require('../src/controllers/achievementController');
    const stats = await achievementController.getUserAchievementStats(11);
    console.log('📊 Updated user stats:', stats);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompleteLessonEndpoint().then(() => {
  console.log('\n✅ Endpoint test completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test error:', err);
  process.exit(1);
});