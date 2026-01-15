import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const authEl = document.getElementById("auth");
const appEl = document.getElementById("app");
const logoutBtn = document.getElementById("logoutBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login");
const registerBtn = document.getElementById("register");
const googleBtn = document.getElementById("google");

onAuthStateChanged(auth, user => {
  if (user) {
    authEl.classList.add("hidden");
    appEl.classList.remove("hidden");
    // load user chats from localStorage keyed by uid
    loadChatsForUser(user.uid);
  } else {
    authEl.classList.remove("hidden");
    appEl.classList.add("hidden");
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) return alert("Введите email и пароль");
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) { alert(e.message || "Ошибка входа"); }
});

registerBtn.addEventListener("click", async () => {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) return alert("Введите email и пароль");
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Аккаунт создан");
  } catch (e) { alert(e.message || "Ошибка регистрации"); }
});

googleBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) { alert(e.message || "Ошибка Google входа"); }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("currentChat");
  });
}

// helper to load chats for user (simple localStorage per uid)
function loadChatsForUser(uid) {
  const key = `absai_chats_${uid}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify([]));
  }
  // populate sidebar list
  const chats = JSON.parse(localStorage.getItem(key) || "[]");
  const list = document.getElementById("chatsList");
  list.innerHTML = "";
  chats.forEach(c => {
    const el = document.createElement("div");
    el.className = "chat-item";
    el.textContent = c.title || "Новый чат";
    el.onclick = () => {
      localStorage.setItem("currentChat", c.id);
      loadChat(c.id);
      document.getElementById("sidebar").classList.add("hidden");
      document.getElementById("overlay").classList.add("hidden");
    };
    list.appendChild(el);
  });
}

export function saveChatForUser(uid, chat) {
  const key = `absai_chats_${uid}`;
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  // upsert
  const i = arr.findIndex(x => x.id === chat.id);
  if (i >= 0) arr[i] = chat; else arr.unshift(chat);
  localStorage.setItem(key, JSON.stringify(arr));
}
