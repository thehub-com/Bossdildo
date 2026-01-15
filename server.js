import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import chatStreamRouter from "./routes/chatStream.js";
import chatRouter from "./routes/chat.js";
import { moderate } from "./middleware/moderation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// basic rate limiter
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 40
}));

// moderation middleware for API routes
app.use("/api", moderate);

// serve static frontend from public/
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// api routes
app.use("/api/chat", chatRouter); // non-streaming simple endpoint
app.use("/api/chat-stream", chatStreamRouter); // SSE streaming

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ABS AI running on port ${PORT}`);
});
