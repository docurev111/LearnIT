// src/middleware/roleGuard.js - Simple role-based access control
const db = require('../database/db');

module.exports = function roleGuard(allowedRoles = []) {
  return async function(req, res, next) {
    try {
      // Must have a verified user from previous auth middleware
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const uid = req.user.uid;
      const role = await new Promise((resolve) => {
        db.get('SELECT role FROM users WHERE uid = ? LIMIT 1', [uid], (err, row) => {
          if (err || !row) return resolve(null);
          resolve(row.role);
        });
      });
      if (!role) {
        return res.status(403).json({ error: 'Forbidden', message: 'No role found for user' });
      }
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Forbidden', message: 'Insufficient role' });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
