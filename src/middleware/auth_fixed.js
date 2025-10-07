// src/middleware/auth_fixed.js - Enhanced authentication middleware
const admin = require('../firebase');
const db = require('../database/db');

// Rate limiting store (simple in-memory implementation)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

// Helper function to check rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore.get(ip);
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);

  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  // Add current request
  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);

  return true;
}

// Helper function to create user safely
async function ensureUserExists(uid, email, displayName = null) {
  return new Promise((resolve, reject) => {
    const safeEmail = email || `${uid}@example.com`;
    const safeDisplay = (displayName && String(displayName).trim())
      ? String(displayName).trim()
      : (email ? String(email).split('@')[0] : `user_${String(uid).slice(0, 6)}`);

    // Check if user exists first
    db.get('SELECT id FROM users WHERE uid = ?', [uid], (err, existingUser) => {
      if (err) {
        console.error('Database error checking user:', err);
        return reject(err);
      }

      if (existingUser) {
        return resolve(existingUser.id); // User exists, return ID
      }

      // Create new user
      db.run(
        'INSERT INTO users (uid, email, displayName, role, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [uid, safeEmail, safeDisplay, 'student'],
        function(err) {
          if (err) {
            console.error('Error creating user:', err);
            return reject(err);
          }

          const userId = this.lastID;

          // Initialize XP record for new user
          db.run(
            'INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)',
            [userId, 0, 1],
            (xpErr) => {
              if (xpErr) {
                console.error('Error creating XP record:', xpErr);
                // Don't reject here as user was created successfully
              }
              resolve(userId);
            }
          );
        }
      );
    });
  });
}

// Enhanced authentication middleware
async function verifyFirebaseToken(req, res, next) {
  try {
    // Development override: allow 'Bearer DEV' to bypass Firebase in non-production
    const isProd = process.env.NODE_ENV === 'production';
    const devAuthHeader = req.headers.authorization;
    if (!isProd && devAuthHeader && devAuthHeader.startsWith('Bearer ')) {
      const devToken = devAuthHeader.split(' ')[1];
      if (devToken === 'DEV') {
        const devUid = req.headers['x-dev-uid'] || 'dev-admin';
        const devEmail = req.headers['x-dev-email'] || 'admin@gmail.com';
        const devRole = (req.headers['x-dev-role'] || 'admin').toString();
        req.user = {
          uid: String(devUid),
          email: String(devEmail),
          displayName: 'Dev User',
          emailVerified: true,
          role: devRole
        };
        return next();
      }
    }
    // Rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header with Bearer token required'
      });
    }

    const idToken = authHeader.split(' ')[1];

    // Validate token format (basic check)
    if (!idToken || idToken.length < 20) {
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Token appears to be malformed'
      });
    }

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Validate token claims
    if (!decodedToken.uid) {
      return res.status(401).json({
        error: 'Invalid token claims',
        message: 'Token missing required user ID'
      });
    }

    // Allow unverified email for:
    // - user creation (POST /users)
    // - privileged users (admin/teacher) or admin demo email
    const isUserCreation = req.method === 'POST' && req.path === '/users';
    const isGetOwnUser = req.method === 'GET' && typeof req.path === 'string' && req.path.startsWith('/users/');

    // Determine if user is privileged (admin/teacher) via DB or demo email
    let isPrivileged = false;
    const isAdminEmail = decodedToken.email && decodedToken.email.toLowerCase() === 'admin@gmail.com';
    if (isAdminEmail) {
      isPrivileged = true;
    } else {
      try {
        await new Promise((resolve) => {
          db.get('SELECT role FROM users WHERE uid = ? LIMIT 1', [decodedToken.uid], (err, row) => {
            if (!err && row && (row.role === 'admin' || row.role === 'teacher')) {
              isPrivileged = true;
            }
            resolve();
          });
        });
      } catch (_) {}
    }

    if (decodedToken.email && !decodedToken.email_verified && !isUserCreation && !isPrivileged) {
      return res.status(401).json({
        error: 'Email not verified',
        message: 'Please verify your email address'
      });
    }

    // Store user info in request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.display_name,
      emailVerified: decodedToken.email_verified,
      role: 'student' // Default role, can be enhanced
    };

    // Only create user if this is a user creation request
    if (isUserCreation) {
      // Do not auto-create here; let the POST /users route handle creation explicitly.
      // Optionally, attach existing user id if present (non-blocking).
      try {
        await new Promise((resolve) => {
          db.get('SELECT id FROM users WHERE uid = ?', [decodedToken.uid], (err, row) => {
            if (!err && row) {
              req.user.id = row.id;
            }
            resolve();
          });
        });
      } catch (_) {}
    } else {
      // For other requests, ensure user exists (but do NOT auto-create on GET /users/:uid)
      if (!isGetOwnUser) {
        try {
          const userId = await ensureUserExists(decodedToken.uid, decodedToken.email);
          req.user.id = userId;
        } catch (userError) {
          console.error('Error verifying user exists:', userError);
          // Don't fail the request if user verification fails
          // Just log and continue
        }
      } else {
        // Attach existing id if present (non-blocking)
        try {
          await new Promise((resolve) => {
            db.get('SELECT id FROM users WHERE uid = ?', [decodedToken.uid], (err, row) => {
              if (!err && row) req.user.id = row.id;
              resolve();
            });
          });
        } catch (_) {}
      }
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please refresh your authentication token'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token revoked',
        message: 'This token has been revoked'
      });
    }

    if (error.code === 'auth/user-disabled') {
      return res.status(401).json({
        error: 'User disabled',
        message: 'This user account has been disabled'
      });
    }

    // Generic error for other cases
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
}

// Cleanup function for rate limiting (call periodically)
function cleanupRateLimitStore() {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  for (const [ip, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    if (validRequests.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, validRequests);
    }
  }
}

// Clean up rate limit store every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

module.exports = verifyFirebaseToken;
