// src/firebase.js - Resilient Firebase Admin init with dev fallback
const adminLib = require('firebase-admin');

let admin = null;
try {
  // Try loading service account from file
  // Prefer env JSON if provided to support production deployments without a file
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : require('./serviceAccountKey.json');

  adminLib.initializeApp({
    credential: adminLib.credential.cert(svcJson)
  });
  admin = adminLib;
  console.log('Firebase Admin initialized');
} catch (e) {
  console.warn('Firebase Admin not initialized. Running in DEV mode or missing credentials.');
  // Provide a minimal stub so require() does not crash. Middleware supports a DEV path.
  admin = {
    auth() {
      return {
        async verifyIdToken() {
          throw Object.assign(new Error('Firebase Admin not configured'), { code: 'auth/admin-not-configured' });
        }
      };
    }
  };
}

module.exports = admin;
