// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCllIOKW6TOo8BW2c2MjRQ-BB0_-Iyuh8c",
  authDomain: "ghosthub-6e484.firebaseapp.com",
  projectId: "ghosthub-6e484",
  storageBucket: "ghosthub-6e484.firebasestorage.app",
  messagingSenderId: "873073341969",
  appId: "1:873073341969:web:c21b046af50fa2416163b0",
  measurementId: "G-QBB3K4M8R4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Set persistence to LOCAL (keeps user logged in even after browser closes)
// This ensures tokens persist and can be refreshed automatically
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };

