import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANdR3YT6_4QN8U6pDfi6NSKUEqQ23dyho",
  authDomain: "apex-calisthenics-2996c.firebaseapp.com",
  projectId: "apex-calisthenics-2996c",
  storageBucket: "apex-calisthenics-2996c.firebasestorage.app",
  messagingSenderId: "688212368969",
  appId: "1:688212368969:web:165a0e7082d6a2a487e998",
  measurementId: "G-5FHHDQ0JGR"
};

// ANTI-CRASH FIX: Prevents Firebase from initializing twice during hot-reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
