// Assign Virtue Points to specific users
const db = require('../backend/database/db');

console.log('🎯 ASSIGNING VIRTUE POINTS TO USERS...\n');

async function assignVirtuePoints() {
  try {
    // Get all users
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, uid, displayName, email FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('👥 USERS FOUND:');
    users.forEach(user => {
      console.log(`   ID: ${user.id}, Name: ${user.displayName}, Email: ${user.email}`);
    });
    console.log('');

    // Define virtue points assignments
    const assignments = [
      { displayName: 'deanalcober', virtuePoints: 300 },
      { displayName: 'david lee', virtuePoints: 100 },
      { displayName: 'sarah kim', virtuePoints: 250 }
    ];

    // Process each assignment
    for (const assignment of assignments) {
      const user = users.find(u => u.displayName.toLowerCase() === assignment.displayName.toLowerCase());

      if (user) {
        // Update virtue points
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE xp SET virtue_points = ? WHERE user_id = ?',
            [assignment.virtuePoints, user.id],
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        });

        console.log(`✅ Assigned ${assignment.virtuePoints} Virtue Points to ${user.displayName} (ID: ${user.id})`);
      } else {
        console.log(`❌ User "${assignment.displayName}" not found`);
      }
    }

    console.log('\n🎉 Virtue Points assignment complete!');

  } catch (err) {
    console.error('❌ Error assigning virtue points:', err);
  } finally {
    db.close();
  }
}

assignVirtuePoints();