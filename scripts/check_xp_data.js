// Check XP table structure and data
const db = require('../src/database/db');

console.log('⚡ CHECKING XP TABLE...\n');

// Check XP table structure
db.all("PRAGMA table_info(xp)", (err, columns) => {
  if (err) {
    console.error('❌ Error checking xp table:', err);
    process.exit(1);
  }

  console.log('📋 XP TABLE STRUCTURE:');
  columns.forEach(col => {
    console.log(`   📝 ${col.name} (${col.type}) ${col.notnull ? '- NOT NULL' : ''} ${col.pk ? '- PRIMARY KEY' : ''}`);
  });

  // Check current XP data
  db.all("SELECT * FROM xp ORDER BY user_id", (err, xpRecords) => {
    if (err) {
      console.error('❌ Error getting XP data:', err);
      process.exit(1);
    }

    console.log(`\n📊 CURRENT XP RECORDS (${xpRecords.length} total):`);
    xpRecords.forEach(record => {
      console.log(`   🎯 User ${record.user_id}: ${record.total_xp || 0} XP (Level ${record.level || 1})`);
    });

    // Check specifically for our test user (ID: 11)
    const userXP = xpRecords.find(r => r.user_id === 11);
    if (userXP) {
      console.log(`\n👤 TEST USER (ID: 11) XP STATUS:`);
      console.log(`   ⚡ Total XP: ${userXP.total_xp || 0}`);
      console.log(`   📈 Level: ${userXP.level || 1}`);
      console.log(`   📅 Last Updated: ${userXP.updated_at || 'Never'}`);
    } else {
      console.log(`\n⚠️  TEST USER (ID: 11) HAS NO XP RECORD`);
    }

    process.exit(0);
  });
});