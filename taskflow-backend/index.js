const express = require("express");
const cors    = require("cors");
const store   = require("./data/store");

const taskRouter = require("./routes/tasks");

const app  = express();
const PORT = 3001;

// ── Middleware ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // localhost'tan gelen tüm portlara izin ver (3000, 3001, 3002, vb.)
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    cb(new Error("CORS: izin verilmeyen origin"));
  },
}));
app.use(express.json());

// ── Request Logger ──────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────────
app.use("/tasks", taskRouter);

// ── GET /stats ──────────────────────────────────────────────────────────────────
app.get("/stats", (_req, res) => {
  const tasks = store.getAll();
  const now   = new Date();

  // Bu haftanın sınırları (Pazartesi–Pazar)
  const weekStart = new Date(now);
  const dayOfWeek = weekStart.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + diffToMon);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Statüse göre dağılım
  const byStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  // Kategoriye göre dağılım
  const byCategory = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  // Bu hafta deadline'ı olan aktif task'lar
  const deadlineThisWeek = tasks.filter((t) => {
    if (!t.deadline || t.status === "tamamlandı") return false;
    const dl = new Date(t.deadline);
    return dl >= weekStart && dl <= weekEnd;
  }).length;

  // Kritik öncelikli task sayısı
  const criticalCount = tasks.filter((t) => t.priority === "kritik").length;

  // Tamamlanma yüzdesi
  const completedCount  = byStatus["tamamlandı"] || 0;
  const completionRate  = tasks.length > 0
    ? `${Math.round((completedCount / tasks.length) * 100)}%`
    : "0%";

  res.json({
    success: true,
    data: {
      total: tasks.length,
      byStatus,
      byCategory,
      deadlineThisWeek,
      criticalCount,
      completionRate,
      weekRange: {
        start: weekStart.toISOString(),
        end:   weekEnd.toISOString(),
      },
    },
  });
});

// ── Root ────────────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "TaskFlow Backend API",
    version: "1.0.0",
    port: PORT,
    endpoints: {
      "GET    /tasks":     "Tüm task'ları listele (?category, ?priority, ?status)",
      "GET    /tasks/:id": "Tek task",
      "POST   /tasks":     "Yeni task ekle",
      "PUT    /tasks/:id": "Task güncelle",
      "DELETE /tasks/:id": "Task sil",
      "GET    /stats":     "İstatistikler",
    },
  });
});

// ── 404 ─────────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint bulunamadı." });
});

// ── Global Error Handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Sunucu hatası.", error: err.message });
});

// ── Start ────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow Backend çalışıyor → http://localhost:${PORT}`);
  console.log(`   Başlangıç verisi: ${store.getAll().length} task yüklendi.\n`);
});
