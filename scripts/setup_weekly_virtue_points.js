// Check XP table structure and implement weekly Virtue Points tracking
const db = require('../backend/database/db');

async function setupWeeklyVirtuePoints() {
  console.log('🔄 SETTING UP WEEKLY VIRTUE POINTS TRACKING...\n');

  try {
    // Check current XP table structure
    console.log('📊 CURRENT XP TABLE STRUCTURE:');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(xp)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    columns.forEach(col => {
      console.log(`   ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULLABLE'}`);
    });

    // Add weekly_virtue_points column if it doesn't exist
    console.log('\n➕ ADDING WEEKLY VIRTUE POINTS COLUMN...');
    await new Promise((resolve, reject) => {
      db.run('ALTER TABLE xp ADD COLUMN weekly_virtue_points INTEGER DEFAULT 0', (err) => {
        if (err) {
          // Column might already exist, that's okay
          console.log('   Column may already exist, continuing...');
        } else {
          console.log('   ✅ Added weekly_virtue_points column');
        }
        resolve();
      });
    });

    // Add week_start_date column to track when the week started
    console.log('➕ ADDING WEEK START DATE COLUMN...');
    await new Promise((resolve, reject) => {
      db.run('ALTER TABLE xp ADD COLUMN week_start_date TEXT', (err) => {
        if (err) {
          console.log('   Column may already exist, continuing...');
        } else {
          console.log('   ✅ Added week_start_date column');
        }
        resolve();
      });
    });

    // Initialize weekly data for existing users
    console.log('\n🔄 INITIALIZING WEEKLY DATA FOR EXISTING USERS...');
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week
    const weekStartDate = monday.toISOString().split('T')[0];

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE xp SET weekly_virtue_points = 0, week_start_date = ? WHERE week_start_date IS NULL',
        [weekStartDate],
        function(err) {
          if (err) reject(err);
          else {
            console.log(`   ✅ Initialized weekly data for ${this.changes} users`);
            resolve();
          }
        }
      );
    });

    console.log('\n✅ WEEKLY VIRTUE POINTS SETUP COMPLETE!');
    console.log(`   Week starts on: ${weekStartDate}`);

  } catch (err) {
    console.error('❌ Error setting up weekly Virtue Points:', err);
  } finally {
    db.close();
  }
}

setupWeeklyVirtuePoints();