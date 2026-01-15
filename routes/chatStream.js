// SSE streaming endpoint — принимает POST, пишет SSE chunks
import express from "express";
import { askYandex } from "../services/yandexLLM.js";

const router = express.Router();

router.post("/", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.write(`data: [ERROR] Нет prompt\n\n`);
      return res.end();
    }

    // Get full answer from Yandex
    const answer = await askYandex(prompt);

    // Stream word-by-word (small delay for UX)
    const words = answer.split(/\s+/);
    for (const w of words) {
      res.write(`data: ${w}\n\n`);
      // small pause to simulate live typing
      await new Promise(r => setTimeout(r, 28));
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error("chatStream error:", err);
    res.write(`data: [ERROR]\n\n`);
    res.end();
  }
});

export default router;
