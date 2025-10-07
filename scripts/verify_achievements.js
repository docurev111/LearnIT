// scripts/verify_achievements.js - Verify achievement system setup
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

console.log('🏆 VERIFYING ACHIEVEMENT SYSTEM SETUP...\n');

// Check badge categories
db.all('SELECT * FROM badge_categories ORDER BY id', (err, categories) => {
  if (err) {
    console.error('❌ Error reading badge categories:', err);
    return;
  }
  
  console.log('📋 BADGE CATEGORIES:');
  categories.forEach(cat => {
    console.log(`   ${cat.icon} ${cat.name} - ${cat.description}`);
  });
  
  // Check total badges
  db.get('SELECT COUNT(*) as count FROM badges', (err, result) => {
    if (err) {
      console.error('❌ Error counting badges:', err);
      return;
    }
    
    console.log(`\n🏅 TOTAL BADGES: ${result.count}`);
    
    // Check rarity distribution
    db.all('SELECT rarity, COUNT(*) as count FROM badges GROUP BY rarity ORDER BY count DESC', (err, rarities) => {
      if (err) {
        console.error('❌ Error reading rarities:', err);
        return;
      }
      
      console.log('\n📊 RARITY DISTRIBUTION:');
      rarities.forEach(r => {
        console.log(`   ${r.rarity}: ${r.count} badges`);
      });
      
      // Show sample badges
      db.all('SELECT name, icon, rarity, condition_type FROM badges ORDER BY rarity, name LIMIT 10', (err, samples) => {
        if (err) {
          console.error('❌ Error reading sample badges:', err);
          return;
        }
        
        console.log('\n🎯 SAMPLE BADGES:');
        samples.forEach(badge => {
          console.log(`   ${badge.icon} ${badge.name} (${badge.rarity}) - ${badge.condition_type}`);
        });
        
        console.log('\n✅ Achievement system verification complete!');
        console.log('🚀 Your LearnIT app now has a comprehensive badge system!');
        
        db.close();
      });
    });
  });
});