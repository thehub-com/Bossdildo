// app.js
import { auth } from "./firebase.js";

/* ===== DOM ===== */
const chat = document.getElementById("chat");
const input = document.getElementById("prompt");
const sendBtn = document.getElementById("send");

/* ===== INIT ===== */
chat.innerHTML = `
  <div class="msg ai">
    🤖 <b>ABS AI</b><br/>
    Готов к работе
  </div>
`;

/* ===== SEND MESSAGE ===== */
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  // user message
  chat.innerHTML += `
    <div class="msg user">
      <b>Ты</b><br/>${text}
    </div>
  `;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    chat.innerHTML += `
      <div class="msg ai">
        <b>ABS AI</b><br/>${data.answer}
      </div>
    `;
  } catch (e) {
    chat.innerHTML += `
      <div class="msg ai">
        ❌ Ошибка соединения
      </div>
    `;
  }

  chat.scrollTop = chat.scrollHeight;
};

/* ===== ENTER KEY ===== */
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});
