# 🚀 TaskFlow — Görev Yöneticisi

TaskFlow, kişisel ve ekip bazlı görevleri modern, hızlı ve yenilikçi bir arayüzle takip etmenizi sağlayan **Full-Stack** bir görev yönetim sistemidir. Gerçek zamanlı istatistikler, gelişmiş filtreleme ve kategori tabanlı dağılım özellikleriyle günlük iş akışınızı hızlandırır.

## 🌍 Canlı Demo ve Bağlantılar

- **Canlı Site:** [TaskFlow Dashboard (AWS S3)](http://taskflowcloud.s3-website.eu-north-1.amazonaws.com)
- **Backend API:** [API Endpoint (AWS EC2)](http://51.20.123.148:3001/tasks)
- **GitHub Repository:** [TaskFlow Repo](https://github.com/suleymank3291/cloud_odev)

---

## ✨ Özellikler

- **Görev Yönetimi:** Görev ekleme, düzenleme, silme ve anlık listeleme.
- **Kategori Takibi:** İş, Kişisel, Okul ve Sağlık olmak üzere gruplandırılmış görev dağılımı.
- **Öncelik Seviyeleri:** Düşük, Orta, Yüksek ve Kritik öncelik göstergeleri.
- **Durum (Status) Takibi:** Yapılacak, Devam Ediyor ve Tamamlandı şeklinde sürükleyici işleyiş.
- **Deadline (Bitiş Tarihi):** Bu hafta yaklaşan görevlerin özet takibi.
- **Dashboard İstatistikleri:** Tamamlanma oranları ve kategori dağılımlarını anlık gösteren dinamik grafikler.
- **Dark Mode:** Açık (Light) ve Koyu (Dark) tema desteği ile göz yormayan deneyim.

---

## 🛠️ Kullanılan Teknolojiler

**Frontend:**
- React (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui & Lucide React

**Backend:**
- Node.js
- Express.js

**Bulut (Cloud) Altyapısı (AWS):**
- **AWS S3:** Frontend statik hosting barındırma.
- **AWS EC2:** Node.js/Express.js Backend API sunucusu. (PM2 ile servis ediliyor).

---

## 🏗️ Proje Mimarisi

Sistem **Monorepo** standartlarına uygun çift uçlu bir bulut mimarisidir:
Kullanıcılar React tabanlı **Frontend** arayüzüne (AWS S3 üzerinden) erişir. Tıklanan her işlem fetch API aracılığı ile Ubuntu Linux üzerinde koşan **Backend** sunucusuna (AWS EC2) 3001 numaralı porttan RESTful standartlarında istek atar. CORS politikaları ayarlı ve güvenli veri iletişimi sağlanır.

---

## 📖 API Uç Noktaları (Endpoints)

Backend EC2 sunucusu aşağıdaki uç noktaları desteklemektedir:

| HTTP Metodu | Endpoint | Açıklama |
| :--- | :--- | :--- |
| **GET** | `/tasks` | Tüm görevleri getirir. (Query: `?category`, `?priority`, `?status`) |
| **POST** | `/tasks` | Sisteme yeni bir görev ekler. |
| **PUT** | `/tasks/:id` | ID'si verilen görevin özelliklerini/durumunu günceller. |
| **DELETE** | `/tasks/:id` | ID'si verilen görevi kalıcı olarak siler. |
| **GET** | `/stats` | Dashboard grafikleri için istatistik ve metrik oranlarını getirir. |

---

## 💻 Lokal Kurulum Adımları

Projeyi kendi bilgisayarınızda (Lokal) test etmek isterseniz:

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/KULLANICI_ADI/TaskFlow.git
cd TaskFlow
```

### 2. Backend Sunucusunu Başlatma
```bash
cd taskflow-backend
npm install
node index.js
```
*(Backend sunucusu `http://localhost:3001` adresinde ayağa kalkacaktır.)*

### 3. Frontend Dashboard'u Başlatma
```bash
cd taskflow-dashboard
npm install
npm run dev -- --port 3002
```
*(Uygulamaya tarayıcı üzerinden `http://localhost:3002` adresinden erişebilirsiniz.)*

---

## 📁 Proje Yapısı (Klasör Ağacı)

```text
TaskFlow/
├── taskflow-backend/          # Node.js API katmanı
│   ├── data/                  # In-Memory veri modeli
│   ├── routes/                # Endpoint yolları (tasks.js)
│   ├── index.js               # Express sunucusu ana girişi
│   └── package.json
│
└── taskflow-dashboard/        # Next.js uygulama katmanı
    ├── app/                   # Uygulama root ve sayfa düzenleri
    ├── components/            # Yeniden kullanılabilir UI parçaları
    ├── lib/                   # API servis katmanları (api.ts)
    ├── public/                # İkonlar ve medya varlıkları
    ├── tailwind.config.ts     # CSS framework ayarları
    └── package.json
```
