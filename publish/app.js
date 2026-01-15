const chat = document.getElementById("chat");
const input = document.getElementById("prompt");
const send = document.getElementById("send");

send.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  chat.innerHTML += `<div><b>Ты:</b> ${text}</div>`;
  input.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text })
  });

  const data = await res.json();
  chat.innerHTML += `<div><b>ABS:</b> ${data.reply}</div>`;
};
