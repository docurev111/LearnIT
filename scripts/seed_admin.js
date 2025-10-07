// scripts/seed_admin.js - Insert or update an admin user without wiping data
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_UID = process.env.ADMIN_UID || 'admin-uid-placeholder';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Demo Admin';
const ADMIN_CLASS = process.env.ADMIN_CLASS || 'class-7a';

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

(async () => {
  try {
    await run('BEGIN TRANSACTION');

    const userByEmail = await get('SELECT * FROM users WHERE email = ?', [ADMIN_EMAIL]);
    const userByUid = await get('SELECT * FROM users WHERE uid = ?', [ADMIN_UID]);

    if (!userByEmail && !userByUid) {
      // Neither exists -> insert fresh
      const result = await run(
        'INSERT INTO users (uid, displayName, email, role, class_id) VALUES (?, ?, ?, ?, ?)',
        [ADMIN_UID, ADMIN_NAME, ADMIN_EMAIL, 'admin', ADMIN_CLASS]
      );
      const userId = result.lastID;
      console.log(`Created admin user id=${userId}`);
      await run('INSERT OR IGNORE INTO xp (user_id, total_xp, current_level) VALUES (?, 0, 1)', [userId]);
    } else if (userByEmail && !userByUid) {
      // Email exists; update that row with desired uid/role/class/name
      await run('UPDATE users SET uid = ?, role = ?, class_id = ?, displayName = ? WHERE id = ?', [
        ADMIN_UID, 'admin', ADMIN_CLASS, ADMIN_NAME, userByEmail.id
      ]);
      console.log(`Updated admin (by email) id=${userByEmail.id}`);
      await run('INSERT OR IGNORE INTO xp (user_id, total_xp, current_level) VALUES (?, 0, 1)', [userByEmail.id]);
    } else if (!userByEmail && userByUid) {
      // UID exists; update that row with desired email/role/class/name
      await run('UPDATE users SET email = ?, role = ?, class_id = ?, displayName = ? WHERE id = ?', [
        ADMIN_EMAIL, 'admin', ADMIN_CLASS, ADMIN_NAME, userByUid.id
      ]);
      console.log(`Updated admin (by uid) id=${userByUid.id}`);
      await run('INSERT OR IGNORE INTO xp (user_id, total_xp, current_level) VALUES (?, 0, 1)', [userByUid.id]);
    } else {
      // Both exist but could be different rows -> reconcile to the email row
      if (userByEmail.id !== userByUid.id) {
        // Free up the uid on the uid row to avoid UNIQUE conflict
        const newOldUid = `${userByUid.uid}_old_${Date.now()}`;
        await run('UPDATE users SET uid = ? WHERE id = ?', [newOldUid, userByUid.id]);
        console.log(`Reassigned old uid for user id=${userByUid.id} -> ${newOldUid}`);
      }
      // Ensure the email row has the desired uid and attributes
      await run('UPDATE users SET uid = ?, role = ?, class_id = ?, displayName = ? WHERE id = ?', [
        ADMIN_UID, 'admin', ADMIN_CLASS, ADMIN_NAME, userByEmail.id
      ]);
      console.log(`Consolidated admin to id=${userByEmail.id}`);
      await run('INSERT OR IGNORE INTO xp (user_id, total_xp, current_level) VALUES (?, 0, 1)', [userByEmail.id]);
    }

    await run('COMMIT');
    console.log('✅ Admin seed complete');
  } catch (e) {
    try { await run('ROLLBACK'); } catch {}
    console.error('Admin seed failed:', e);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
