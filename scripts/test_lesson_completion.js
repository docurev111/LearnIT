// Test lesson completion and achievement awarding
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin (reuse from existing setup)
const serviceAccount = require('../src/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function testLessonCompletion() {
  try {
    console.log('🧪 TESTING LESSON COMPLETION & ACHIEVEMENTS...\n');

    // Create a test user token
    const testUid = 'test-user-' + Date.now();
    const customToken = await admin.auth().createCustomToken(testUid);
    
    console.log('✅ Created test user:', testUid);

    // Get ID token (simulating what happens in the app)
    const idToken = await admin.auth().verifyIdToken(customToken);
    console.log('✅ Generated ID token');

    // First, create the user in our database
    const userRes = await fetch('http://localhost:3001/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebase_uid: testUid,
        display_name: 'Test User',
        email: 'test@example.com'
      })
    });

    let userId;
    if (userRes.ok) {
      const userData = await userRes.json();
      userId = userData.id;
      console.log('✅ Created user in database, ID:', userId);
    } else {
      console.log('❌ Failed to create user:', await userRes.text());
      return;
    }

    // Now test lesson completion
    console.log('\n🎯 Testing lesson completion...');
    const completeRes = await fetch('http://localhost:3001/complete-lesson', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        lesson_id: 1
      })
    });

    if (completeRes.ok) {
      const result = await completeRes.json();
      console.log('✅ Lesson completion response:', JSON.stringify(result, null, 2));
      
      if (result.new_achievements && result.new_achievements.length > 0) {
        console.log('\n🎉 NEW ACHIEVEMENTS AWARDED:');
        result.new_achievements.forEach(achievement => {
          console.log(`   🏆 ${achievement.name} - ${achievement.description}`);
        });
      } else {
        console.log('\n⚠️  No achievements were awarded');
      }
    } else {
      console.log('❌ Lesson completion failed:', await completeRes.text());
    }

    // Check user's achievements
    console.log('\n📊 Checking user achievements...');
    const achievementsRes = await fetch(`http://localhost:3001/user/achievements/${userId}`, {
      headers: {
        'Authorization': `Bearer ${customToken}`
      }
    });

    if (achievementsRes.ok) {
      const achievements = await achievementsRes.json();
      console.log('🏆 User achievement stats:', JSON.stringify(achievements, null, 2));
    } else {
      console.log('❌ Failed to get achievements:', await achievementsRes.text());
    }

    // Clean up - delete test user
    console.log('\n🧹 Cleaning up test user...');
    await admin.auth().deleteUser(testUid);
    console.log('✅ Test user deleted');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLessonCompletion().then(() => {
  console.log('\n✅ Test completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test error:', err);
  process.exit(1);
});