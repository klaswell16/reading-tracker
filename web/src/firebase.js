import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ6IpzV4Dy5KNvxxWg2R94dGoRcT4fam0",

  authDomain: "manga-tracker-4b098.firebaseapp.com",

  projectId: "manga-tracker-4b098",

  storageBucket: "manga-tracker-4b098.firebasestorage.app",

  messagingSenderId: "311600281938",

  appId: "1:311600281938:web:21d66c93d118532980228b",

  measurementId: "G-23JTK1WZR1"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);