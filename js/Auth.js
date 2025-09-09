// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
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

// Elements
const signUpForm = document.getElementById("signupForm");
const signInForm = document.getElementById("signinForm");
const forgotPassword = document.getElementById("forgotPassword");
const popup = document.getElementById("popup");

// Popup helper
function showPopup(message) {
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}

// 🔹 Sign Up
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullName = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  if (password !== confirm) {
    showPopup("Passwords do not match!");
    return;
  }

  try {
    // 1️⃣ Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Add user to Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName,
      email: email,
      uid: user.uid,
      createdAt: new Date().toISOString()
    });

    showPopup("Account created successfully!");
    signUpForm.reset();
  } catch (error) {
    showPopup(error.message);
  }
});

// 🔹 Sign In
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signinEmail").value;  // ⚠ make sure the ID matches your HTML
  const password = document.getElementById("signinPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showPopup("Signed in successfully!");

    // Redirect after 1 second (so popup is visible briefly)
    setTimeout(() => {
      window.location.href = "index.html"; 
    }, 1000);

    signInForm.reset();
  } catch (error) {
    showPopup(error.message);
  }
});


// 🔹 Forgot Password
forgotPassword.addEventListener("click", async () => {
  const email = document.getElementById("signinEmail").value;
  if (!email) {
    showPopup("Enter your email above first!");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showPopup("Password reset email sent!");
  } catch (error) {
    showPopup(error.message);
  }
});
