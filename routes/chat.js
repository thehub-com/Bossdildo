// simple non-stream endpoint (returns full answer)
import express from "express";
import { askYandex } from "../services/yandexLLM.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Нет prompt" });

    const answer = await askYandex(prompt);
    return res.json({ answer });
  } catch (err) {
    console.error("chat error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
