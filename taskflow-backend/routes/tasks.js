const express = require("express");
const router  = express.Router();
const store   = require("../data/store");

// ─── Validasyon yardımcısı ─────────────────────────────────────────────────────
function validate(body, requireTitle = false) {
  const errors = [];
  const { title, category, priority, status, tags, deadline } = body;

  if (requireTitle && (!title || typeof title !== "string" || !title.trim()))
    errors.push("'title' alanı zorunludur ve boş olamaz.");

  if (title !== undefined && (typeof title !== "string" || !title.trim()))
    errors.push("'title' geçerli bir string olmalıdır.");

  if (category !== undefined && !store.CATEGORIES.includes(category))
    errors.push(`'category' şunlardan biri olmalı: ${store.CATEGORIES.join(", ")}`);

  if (priority !== undefined && !store.PRIORITIES.includes(priority))
    errors.push(`'priority' şunlardan biri olmalı: ${store.PRIORITIES.join(", ")}`);

  if (status !== undefined && !store.STATUSES.includes(status))
    errors.push(`'status' şunlardan biri olmalı: ${store.STATUSES.join(", ")}`);

  if (tags !== undefined && !Array.isArray(tags))
    errors.push("'tags' bir dizi olmalıdır.");

  if (deadline !== undefined && deadline !== null && isNaN(new Date(deadline).getTime()))
    errors.push("'deadline' geçerli bir ISO tarih string olmalıdır.");

  return errors;
}

// ─── GET /tasks ────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const { category, priority, status } = req.query;
  const data = store.filter({ category, priority, status });
  res.json({ success: true, count: data.length, data });
});

// ─── GET /tasks/:id ────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, message: "Geçersiz ID." });

  const task = store.getById(id);
  if (!task) return res.status(404).json({ success: false, message: `ID ${id} bulunamadı.` });

  res.json({ success: true, data: task });
});

// ─── POST /tasks ───────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const task = store.create(req.body);
  res.status(201).json({ success: true, data: task });
});

// ─── PUT /tasks/:id ────────────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, message: "Geçersiz ID." });

  const errors = validate(req.body, false);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const task = store.update(id, req.body);
  if (!task) return res.status(404).json({ success: false, message: `ID ${id} bulunamadı.` });

  res.json({ success: true, data: task });
});

// ─── DELETE /tasks/:id ─────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, message: "Geçersiz ID." });

  const ok = store.remove(id);
  if (!ok) return res.status(404).json({ success: false, message: `ID ${id} bulunamadı.` });

  res.json({ success: true, message: `ID ${id} silindi.` });
});

// ─── GET /stats ────────────────────────────────────────────────────────────────
router.get("/", (_req, res) => res.redirect("/stats")); // guard

module.exports = router;
