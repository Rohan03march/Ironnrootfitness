import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1705Xy74qwXt8aOgvZGBIYs8uMU6u3js",
  authDomain: "ironnrootfitness-5156e.firebaseapp.com",
  projectId: "ironnrootfitness-5156e",
  storageBucket: "ironnrootfitness-5156e.firebasestorage.app",
  messagingSenderId: "508351386284",
  appId: "1:508351386284:web:289185a2ff7a08b8ef0509",
  measurementId: "G-S6235MZEPC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const contactForm = document.getElementById("contactForm");
const loader = document.getElementById("loader");

let currentUser = null;
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
});

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector("button");
  submitBtn.textContent = "Please wait..."; // Change text
  loader.style.display = "block"; // Show loader

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const phone = document.getElementById("contactPhone").value;
  const message = document.getElementById("contactMessage").value;

  let userData = {};
  if (currentUser) {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        userData = {
          uid: currentUser.uid,
        };
      }
    } catch (err) {
      console.error(err);
    }
  }

  try {
    await addDoc(collection(db, "contacts"), {
      name,
      email,
      phone,
      message,
      user: userData,
      createdAt: new Date().toISOString()
    });
    loader.style.display = "none"; // Hide loader
    submitBtn.textContent = "Send Message"; // Reset button text
    alert("Message sent successfully, We will contact you soon");
    contactForm.reset();
  } catch (err) {
    console.error(err);
    loader.style.display = "none"; // Hide loader
    submitBtn.textContent = "Send Message"; // Reset button text
    alert("Failed to send message. Try again!");
  }
});
