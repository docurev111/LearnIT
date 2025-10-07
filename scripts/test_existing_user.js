// Manually test achievement awarding for existing user
const achievementController = require('../src/controllers/achievementController');

async function testExistingUser() {
  console.log('🧪 TESTING ACHIEVEMENT SYSTEM FOR EXISTING USER...\n');

  try {
    const userId = 11; // deanalcober's user ID from database
    
    console.log('1️⃣ Testing lesson completion achievement...');
    const achievements = await achievementController.checkAndAwardAchievements(
      userId,
      'lesson_completion',
      { lesson_id: 1, completed: true }
    );
    
    console.log(`✅ Achievement check returned ${achievements.length} new badges:`);
    achievements.forEach(achievement => {
      console.log(`   🎉 ${achievement.name} - ${achievement.description} (${achievement.rarity})`);
    });
    
    // Check user's current badge count
    console.log('\n2️⃣ Checking user badge count...');
    const stats = await achievementController.getUserAchievementStats(userId);
    console.log('📊 User achievement stats:', stats);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testExistingUser().then(() => {
  console.log('\n✅ Manual achievement test completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test error:', err);
  process.exit(1);
});