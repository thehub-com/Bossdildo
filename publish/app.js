import { auth } from "./firebase.js";
import { saveChatForUser } from "./auth.js";

const chatEl = document.getElementById("chat");
const promptEl = document.getElementById("prompt");
const sendBtn = document.getElementById("send");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const newChatBtn = document.getElementById("newChatBtn");
const offlineEl = document.getElementById("offline");
const clockEl = document.getElementById("clock");

let currentChat = JSON.parse(localStorage.getItem("currentChatObj") || "null");
let uid = null;

// update clock
function updateClock(){ clockEl.textContent = new Date().toLocaleTimeString().slice(0,5); }
setInterval(updateClock,1000); updateClock();

// offline handling
function updateOnlineStatus(){
  if (!navigator.onLine) {
    offlineEl.classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
  } else {
    offlineEl.classList.add("hidden");
    if (auth.currentUser) document.getElementById("app").classList.remove("hidden");
  }
}
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

// sidebar toggles
menuBtn.onclick = () => { sidebar.classList.toggle("hidden"); overlay.classList.toggle("hidden"); };
overlay.onclick = () => { sidebar.classList.add("hidden"); overlay.classList.add("hidden"); };

// create new chat
newChatBtn.onclick = () => {
  currentChat = { id: Date.now().toString(), title: "Новый чат", messages: [] };
  localStorage.setItem("currentChatObj", JSON.stringify(currentChat));
  renderChat();
  if (auth.currentUser) saveChatForUser(auth.currentUser.uid, currentChat);
};

// rendering
function renderChat(){
  chatEl.innerHTML = "";
  if (!currentChat) {
    chatEl.innerHTML = `<div class="msg ai">Чем могу помочь?</div>`;
    return;
  }
  currentChat.messages.forEach(m => {
    const d = document.createElement("div");
    d.className = `msg ${m.role === "user"? "user":"ai"}`;
    d.innerHTML = `<b>${m.role === "user"? "Ты":"ABS AI"}</b><div>${m.text}</div>`;
    chatEl.appendChild(d);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
}

// add messages (local)
function addMessage(role, text){
  if (!currentChat) {
    currentChat = { id: Date.now().toString(), title: "Новый чат", messages: [] };
  }
  currentChat.messages.push({ role, text, t: Date.now() });
  localStorage.setItem("currentChatObj", JSON.stringify(currentChat));
  renderChat();
  if (auth.currentUser) saveChatForUser(auth.currentUser.uid, currentChat);
}

// SSE streaming call
async function askStream(text){
  addMessage("user", text);
  // create assistant placeholder
  const assistantEl = document.createElement("div");
  assistantEl.className = "msg ai";
  assistantEl.innerHTML = `<b>ABS AI</b><div id="stream">▍</div>`;
  chatEl.appendChild(assistantEl);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ prompt: text })
    });

    if (!res.ok) {
      const txt = await res.text().catch(()=>res.statusText);
      document.getElementById("stream").innerText = "Ошибка: " + (txt||res.status);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      // SSE may come in pieces; split by \n\n and process lines starting with 'data: '
      const parts = chunk.split("\n\n").filter(Boolean);
      for (const p of parts) {
        const line = p.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          // finalize
          document.getElementById("stream").innerText = full;
          addMessage("assistant", full);
          return;
        }
        if (data === "[ERROR]") {
          document.getElementById("stream").innerText = "Ошибка генерации";
          addMessage("assistant", "Ошибка генерации");
          return;
        }
        full += (full ? " " : "") + data;
        document.getElementById("stream").innerText = full + "▍";
        chatEl.scrollTop = chatEl.scrollHeight;
      }
    }
    // fallback finalize
    document.getElementById("stream").innerText = full;
    addMessage("assistant", full);
  } catch (e) {
    console.error("stream error", e);
    document.getElementById("stream").innerText = "Ошибка соединения";
    addMessage("assistant", "Ошибка соединения");
  }
}

send.onclick = async () => {
  const text = promptEl.value.trim();
  if (!text) return;
  if (!navigator.onLine) { alert("Нет интернета"); return; }
  promptEl.value = "";
  await askStream(text);
};

// initialize saved chat
currentChat = JSON.parse(localStorage.getItem("currentChatObj") || "null");
renderChat();
