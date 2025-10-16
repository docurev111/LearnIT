// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBiqHQa87oWcvhACi_nw7ZkjCZPSJ45-w",
  authDomain: "scisteps-a1f37.firebaseapp.com",
  projectId: "scisteps-a1f37",
  storageBucket: "scisteps-a1f37.firebasestorage.app",
  messagingSenderId: "20099865185",
  appId: "1:20099865185:web:6b9f04c9eb9a9ff06de820",
  measurementId: "G-QZV0VMZGXX"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firebase Auth
export const auth = getAuth(app);
