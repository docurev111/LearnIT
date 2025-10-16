const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./src/database/scisteps.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// First check what tables exist
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('Error querying tables:', err.message);
    return;
  }
  console.log('Available tables:', tables.map(t => t.name));
  
  // Check user data
  db.all("SELECT id, email, displayName, class_id, role FROM users WHERE email LIKE '%deanalcober%'", (err, rows) => {
    if (err) {
      console.error('Error querying users:', err.message);
      return;
    }
    console.log('\nUser data for deanalcober:');
    console.log(rows);
    
    if (rows.length > 0) {
      const userId = rows[0].id;
      console.log('\nChecking XP data for user:', userId);
      
      db.all('SELECT * FROM xp WHERE user_id = ?', [userId], (err, xpRows) => {
        if (err) {
          console.error('Error querying XP:', err.message);
          return;
        }
        console.log('XP data:', xpRows);
        
        console.log('\nUser class assignment:', rows[0].class_id);
        if (!rows[0].class_id) {
          console.log('WARNING: User has no class_id assigned!');
          console.log('This is why the leaderboard is empty.');
          console.log('Need to assign user to a class first.');
        }
        
        db.close();
      });
    } else {
      console.log('User not found!');
      db.close();
    }
  });
});