
// server.js
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import chatRouter from "./routes/chat.js";
import chatStreamRouter from "./routes/chatStream.js";
import { moderate } from "./middleware/moderation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());

// Rate limiter (basic)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Apply moderation to API routes
app.use("/api", moderate);

// Serve frontend from "publish" directory (note: folder name is "publish")
const STATIC_DIR = path.join(__dirname, "publish");
app.use(express.static(STATIC_DIR));

// root -> index.html from publish
app.get("/", (req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

// API routes
app.use("/api/chat", chatRouter); // non-stream endpoint
app.use("/api/chat-stream", chatStreamRouter); // SSE streaming endpoint

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Fallback for SPA routes (optional)
app.get("*", (req, res) => {
  // if the request is for an API route, return 404
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ABS AI running on port ${PORT}`);
});
