// ─── Enum sabitler ────────────────────────────────────────────────────────────
const CATEGORIES = ["iş", "kişisel", "okul", "sağlık"];
const PRIORITIES = ["düşük", "orta", "yüksek", "kritik"];
const STATUSES   = ["yapılacak", "devam-ediyor", "tamamlandı"];

// ─── Başlangıç verisi ─────────────────────────────────────────────────────────
let tasks = [
  {
    id: 1,
    title: "Proje sunumunu hazırla",
    description: "Q2 sprint sunumu için slide'ları tamamla",
    category: "iş",
    priority: "kritik",
    status: "devam-ediyor",
    tags: ["sunum", "sprint"],
    deadline: "2026-04-08T09:00:00.000Z",
    createdAt: "2026-04-01T08:00:00.000Z",
  },
  {
    id: 2,
    title: "Algoritma ödevini bitir",
    description: "Dinamik programlama soruları — 3. hafta",
    category: "okul",
    priority: "yüksek",
    status: "yapılacak",
    tags: ["ödev", "algoritma"],
    deadline: "2026-04-09T23:59:00.000Z",
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: 3,
    title: "Spor salonu randevusu",
    description: "Haftalık antrenman seansı",
    category: "sağlık",
    priority: "orta",
    status: "yapılacak",
    tags: ["spor", "rutin"],
    deadline: "2026-04-10T17:00:00.000Z",
    createdAt: "2026-04-02T11:30:00.000Z",
  },
  {
    id: 4,
    title: "Market alışverişi",
    description: "Haftalık temel ihtiyaçlar",
    category: "kişisel",
    priority: "düşük",
    status: "tamamlandı",
    tags: ["rutin"],
    deadline: "2026-04-06T12:00:00.000Z",
    createdAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: 5,
    title: "Müşteri toplantısı notlarını düzenle",
    description: "Cuma toplantısından çıkan aksiyon maddelerini belgele",
    category: "iş",
    priority: "yüksek",
    status: "devam-ediyor",
    tags: ["toplantı", "müşteri"],
    deadline: "2026-04-07T17:00:00.000Z",
    createdAt: "2026-04-03T14:00:00.000Z",
  },
  {
    id: 6,
    title: "Doktor randevusu al",
    description: "Yıllık genel check-up",
    category: "sağlık",
    priority: "kritik",
    status: "yapılacak",
    tags: ["sağlık", "acil"],
    deadline: "2026-04-08T12:00:00.000Z",
    createdAt: "2026-04-03T15:00:00.000Z",
  },
  {
    id: 7,
    title: "React homework — useContext",
    description: "Context API ile tema yönetimi uygulaması yaz",
    category: "okul",
    priority: "orta",
    status: "yapılacak",
    tags: ["react", "ödev"],
    deadline: "2026-04-11T23:59:00.000Z",
    createdAt: "2026-04-04T08:00:00.000Z",
  },
  {
    id: 8,
    title: "Fatura ödemeleri",
    description: "Elektrik, su ve internet faturalarını öde",
    category: "kişisel",
    priority: "yüksek",
    status: "tamamlandı",
    tags: ["finans", "rutin"],
    deadline: "2026-04-05T23:59:00.000Z",
    createdAt: "2026-04-04T09:00:00.000Z",
  },
  {
    id: 9,
    title: "Sprint retrospektif hazırlığı",
    description: "Geçen sprint için iyileştirme noktalarını derle",
    category: "iş",
    priority: "orta",
    status: "yapılacak",
    tags: ["sprint", "retrospektif"],
    deadline: "2026-04-12T10:00:00.000Z",
    createdAt: "2026-04-04T10:00:00.000Z",
  },
  {
    id: 10,
    title: "Yürüyüş — 5 km",
    description: "Sabah parkta yürüyüş",
    category: "sağlık",
    priority: "düşük",
    status: "tamamlandı",
    tags: ["spor", "rutin"],
    deadline: "2026-04-05T08:00:00.000Z",
    createdAt: "2026-04-05T06:00:00.000Z",
  },
];

let nextId = tasks.length + 1;

// ─── CRUD yardımcıları ────────────────────────────────────────────────────────
const getAll  = ()      => tasks;
const getById = (id)    => tasks.find((t) => t.id === id) || null;
const filter  = ({ category, priority, status }) =>
  tasks.filter((t) => {
    if (category && t.category !== category) return false;
    if (priority && t.priority !== priority) return false;
    if (status   && t.status   !== status)   return false;
    return true;
  });

const create = (data) => {
  const task = {
    id:          nextId++,
    title:       data.title.trim(),
    description: data.description || null,
    category:    data.category    || "kişisel",
    priority:    data.priority    || "orta",
    status:      data.status      || "yapılacak",
    tags:        Array.isArray(data.tags) ? data.tags : [],
    deadline:    data.deadline    || null,
    createdAt:   new Date().toISOString(),
  };
  tasks.push(task);
  return task;
};

const update = (id, data) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  // id ve createdAt değiştirilemesin
  const { id: _id, createdAt: _c, ...allowed } = data;
  tasks[idx] = { ...tasks[idx], ...allowed };
  return tasks[idx];
};

const remove = (id) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
};

module.exports = { getAll, getById, filter, create, update, remove, CATEGORIES, PRIORITIES, STATUSES };
