const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./src/database/scisteps.db');

db.all('SELECT id, displayName, email, profile_picture FROM users WHERE email = "deanalcober@gmail.com"', (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('User profile data:', rows);
    if (rows[0] && rows[0].profile_picture) {
      console.log('Profile picture length:', rows[0].profile_picture.length);
      console.log('Starts with:', rows[0].profile_picture.substring(0, 50));
      console.log('Contains data:image:', rows[0].profile_picture.includes('data:image'));
    } else {
      console.log('No profile picture found');
    }
  }
  db.close();
});