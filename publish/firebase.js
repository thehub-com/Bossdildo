// Firebase config (public keys). Replace if different.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDq3tDQnBFXrKW-66JxFPaWG3uso_3XXYY",
  authDomain: "abs-ai-ec395.firebaseapp.com",
  projectId: "abs-ai-ec395",
  storageBucket: "abs-ai-ec395.firebasestorage.app",
  messagingSenderId: "333050406333",
  appId: "1:333050406333:web:51bb5db3c08a75e0e8ded4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
