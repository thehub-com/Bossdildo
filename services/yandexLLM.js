import fetch from "node-fetch";
import { SYSTEM_PROMPT } from "../systemPrompt.js";

export async function askYandex(prompt) {
  const ycKey = process.env.YC_API_KEY;
  const folder = process.env.FOLDER_ID;
  if (!ycKey || !folder) throw new Error("YC API key or FOLDER_ID not set");

  const payload = {
    modelUri: `gpt://${folder}/yandexgpt/latest`,
    completionOptions: { temperature: 0.7, maxTokens: 2000 },
    messages: [
      { role: "system", text: SYSTEM_PROMPT },
      { role: "user", text: prompt }
    ]
  };

  const res = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
    method: "POST",
    headers: {
      "Authorization": `Api-Key ${ycKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  // try multiple fallbacks to extract text
  const text = data?.result?.alternatives?.[0]?.message?.text
    || data?.result?.output_text
    || (typeof data === "string" ? data : null);

  if (!text) {
    console.warn("Yandex response unexpected:", data);
    return "Извините, сейчас нет ответа от модели.";
  }
  return text;
}
