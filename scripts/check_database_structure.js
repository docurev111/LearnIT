// List all database tables
const db = require('../src/database/db');

console.log('📊 CHECKING DATABASE STRUCTURE...\n');

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }

  console.log('📋 DATABASE TABLES:');
  tables.forEach(table => {
    console.log(`   📂 ${table.name}`);
  });

  // Check if users table has XP columns
  db.all("PRAGMA table_info(users)", (err, userColumns) => {
    if (err) {
      console.error('❌ Error checking users table:', err);
      process.exit(1);
    }

    console.log('\n👤 USERS TABLE COLUMNS:');
    userColumns.forEach(col => {
      console.log(`   📝 ${col.name} (${col.type})`);
    });

    // Check if there's a separate XP table
    const xpTables = tables.filter(t => t.name.toLowerCase().includes('xp'));
    if (xpTables.length > 0) {
      console.log('\n⚡ XP-RELATED TABLES:');
      xpTables.forEach(table => {
        console.log(`   🎯 ${table.name}`);
      });
    } else {
      console.log('\n⚠️  No dedicated XP tables found');
    }

    process.exit(0);
  });
});