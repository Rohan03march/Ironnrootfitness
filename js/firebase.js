// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
// Import Firestore
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
    authDomain: "ironnrootfitness-5156e.firebaseapp.com",
    projectId: "ironnrootfitness-5156e",
    storageBucket: "ironnrootfitness-5156e.firebasestorage.app",
    messagingSenderId: "508351386284",
    appId: "1:508351386284:web:289185a2ff7a08b8ef0509",
    measurementId: "G-S6235MZEPC"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


