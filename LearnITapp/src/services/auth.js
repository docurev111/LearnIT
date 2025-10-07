// src/services/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // relative path from services to root

// Sign-up function
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken(); // Firebase ID token
    console.log("Firebase ID Token:", token);
    return token;
  } catch (error) {
    console.error("Sign-up error:", error.message);
    throw error;
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken(); // Firebase ID token
    console.log("Firebase ID Token:", token);
    return token;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};
