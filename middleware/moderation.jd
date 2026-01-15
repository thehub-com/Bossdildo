// basic phrase-based moderation
const banned = [
  "взлом", "hack", "террор", "оружие", "убийств", "наркот", "взорвать", "explosive"
];

export function moderate(req, res, next) {
  try {
    const text = (req.body?.prompt || "").toLowerCase();
    if (!text) return next();
    for (const w of banned) {
      if (text.includes(w)) {
        return res.status(403).json({ error: "Запрос нарушает правила использования ABS AI" });
      }
    }
    next();
  } catch (e) {
    console.error("moderation error", e);
    next();
  }
}
