// src/generateIdToken.js
const admin = require('./firebase');

async function generateIdToken() {
  try {
    const uid = 'student1'; // any test UID
    // 1️⃣ Create a custom token first
    const customToken = await admin.auth().createCustomToken(uid);
    console.log('Custom Token:', customToken);

    // 2️⃣ Exchange custom token for ID token using Firebase Auth REST API
    // Note: This requires your Firebase API key (web API key)
    const fetch = require('node-fetch');
    const apiKey = 'AIzaSyBBiqHQa87oWcvhACi_nw7ZkjCZPSJ45-w'; // from Firebase console
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });
    const data = await res.json();
    console.log('ID Token:', data.idToken);
  } catch (err) {
    console.error(err);
  }
}

generateIdToken();
