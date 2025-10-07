// scripts/test_achievements.js - Test the comprehensive achievement system
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1; // Assuming user with ID 1 exists

async function testAchievementSystem() {
  console.log('🏆 TESTING COMPREHENSIVE ACHIEVEMENT SYSTEM...\n');

  try {
    // Test 1: Get all badges
    console.log('📋 Test 1: Get all available badges');
    try {
      const response = await axios.get(`${BASE_URL}/badges`, {
        headers: { Authorization: 'Bearer test-token' },
        validateStatus: () => true
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`   ✅ Found ${response.data.length} badges`);
        console.log(`   Sample badges: ${response.data.slice(0, 3).map(b => `${b.icon} ${b.name}`).join(', ')}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 2: Get badge categories
    console.log('\n📚 Test 2: Get badge categories');
    try {
      const response = await axios.get(`${BASE_URL}/badges/categories`, {
        headers: { Authorization: 'Bearer test-token' },
        validateStatus: () => true
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`   ✅ Found ${response.data.length} categories`);
        response.data.forEach(cat => {
          console.log(`     ${cat.icon} ${cat.name}`);
        });
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 3: Get user badges
    console.log(`\n🎯 Test 3: Get user badges (User ID: ${TEST_USER_ID})`);
    try {
      const response = await axios.get(`${BASE_URL}/user/badges/${TEST_USER_ID}`, {
        headers: { Authorization: 'Bearer test-token' },
        validateStatus: () => true
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`   ✅ User has ${response.data.length} badges`);
        if (response.data.length > 0) {
          console.log(`   Recent badges: ${response.data.slice(0, 3).map(b => `${b.icon} ${b.name}`).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 4: Get user achievement stats
    console.log(`\n📊 Test 4: Get user achievement statistics`);
    try {
      const response = await axios.get(`${BASE_URL}/user/achievements/${TEST_USER_ID}`, {
        headers: { Authorization: 'Bearer test-token' },
        validateStatus: () => true
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 200) {
        const stats = response.data;
        console.log(`   ✅ Achievement Statistics:`);
        console.log(`     • Total Badges: ${stats.totalBadges}`);
        console.log(`     • Completion: ${stats.completionPercentage}%`);
        console.log(`     • By Rarity: ${JSON.stringify(stats.badgesByRarity)}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 5: Award a badge manually
    console.log(`\n🏅 Test 5: Award badge manually`);
    try {
      const response = await axios.post(`${BASE_URL}/award-badge`, {
        user_id: TEST_USER_ID,
        badge_id: 1, // First Steps badge
        awarded_by: null
      }, {
        headers: { Authorization: 'Bearer test-token' },
        validateStatus: () => true
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`   ✅ ${response.data.message}`);
        if (response.data.badge) {
          console.log(`   Badge: ${response.data.badge.icon} ${response.data.badge.name}`);
        }
      } else {
        console.log(`   ⚠️  ${response.data.message || 'Badge awarding failed'}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 6: Check achievements after activity
    console.log(`\n🎯 Test 6: Check achievements after lesson completion`);
    try {
      const response = await axios.post(`${BASE_URL}/check-achievements`, {
        user_id: TEST_USER_ID,
        activity_type: 'lesson_completion',
        activity_data: { lesson_id: 1, completed: true }
      }, {
        headers: { Authorization: 'Bearer test-token' },
        validateStatus: () => true
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`   ✅ ${response.data.message}`);
        if (response.data.awarded_badges.length > 0) {
          console.log(`   New badges: ${response.data.awarded_badges.map(b => `${b.icon} ${b.name}`).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    console.log('\n🎉 Achievement system testing complete!');
    console.log('\n💡 Notes:');
    console.log('   • Some tests may fail if the server is not running');
    console.log('   • Auth tokens are mocked for testing');
    console.log('   • Badge awarding logic will improve as more user activity is tracked');

  } catch (error) {
    console.error('❌ Overall test error:', error.message);
  }
}

testAchievementSystem();