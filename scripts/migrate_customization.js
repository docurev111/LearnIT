/**
 * Database Migration for Profile Customization
 * 
 * This script creates the user_customization table
 * Run with: node migrate_customization.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database', 'scisteps.db');

console.log('🗃️  Profile Customization Database Migration');
console.log('==========================================\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database:', DB_PATH);
});

// Migration SQL
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS user_customization (
    user_id INTEGER PRIMARY KEY,
    selected_avatar TEXT,
    selected_border TEXT,
    selected_title TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const createIndexSQL = `
  CREATE INDEX IF NOT EXISTS idx_customization_user_id 
  ON user_customization(user_id)
`;

// Run migration
async function runMigration() {
  console.log('📝 Creating user_customization table...');
  
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err.message);
      process.exit(1);
    }
    
    console.log('✅ Table created successfully');
    
    // Create index
    console.log('📝 Creating index...');
    db.run(createIndexSQL, (err) => {
      if (err) {
        console.error('❌ Error creating index:', err.message);
        process.exit(1);
      }
      
      console.log('✅ Index created successfully');
      
      // Verify table structure
      verifyTable();
    });
  });
}

function verifyTable() {
  console.log('\n🔍 Verifying table structure...');
  
  db.all("PRAGMA table_info(user_customization)", (err, rows) => {
    if (err) {
      console.error('❌ Error verifying table:', err.message);
      process.exit(1);
    }
    
    console.log('\n📋 Table Structure:');
    console.table(rows);
    
    // Check for existing data
    db.get("SELECT COUNT(*) as count FROM user_customization", (err, row) => {
      if (err) {
        console.error('❌ Error counting rows:', err.message);
      } else {
        console.log(`\n📊 Current records: ${row.count}`);
      }
      
      console.log('\n🎉 Migration completed successfully!');
      console.log('\nYou can now use the profile customization feature.');
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('\n✅ Database connection closed');
        }
      });
    });
  });
}

// Rollback function (optional)
function rollback() {
  console.log('⚠️  Rolling back migration...');
  
  db.run("DROP TABLE IF EXISTS user_customization", (err) => {
    if (err) {
      console.error('❌ Error dropping table:', err.message);
    } else {
      console.log('✅ Table dropped successfully');
      console.log('Migration rolled back.');
    }
    
    db.close();
  });
}

// Check if rollback flag is passed
const args = process.argv.slice(2);
if (args.includes('--rollback')) {
  rollback();
} else {
  runMigration();
}
