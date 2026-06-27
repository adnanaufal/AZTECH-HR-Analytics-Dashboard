# HR Analytics Dashboard — AZ Tech

Dashboard analitik interaktif untuk menganalisis metrik fungsi Sumber Daya Manusia (HR), mencakup **Compensation & Benefits**, **Turnover**, **Rekrutmen**, dan **Performance Management**.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js >= 18.0.0 |
| **Backend** | Express.js (static server) |
| **Frontend** | HTML5, Vanilla CSS (Custom Design System) |
| **Charts** | Apache ECharts v5.5.1 |
| **Animation** | GSAP v3.12.5 + ScrollTrigger |
| **Counter** | CountUp.js v2.8.0 |
| **Icons** | Lucide Icons v0.344.0 |
| **Typography** | Google Fonts (Outfit & Inter) |
| **Infra** | Docker, Vercel |

## 📊 Dashboard Features

- **6 Tab** — Ringkasan, Compensation, Turnover, Rekrutmen, Performance, Data Tabel
- **30+ Chart Interaktif** — Bar, Line, Pie, Radar, Scatter, Funnel, Gauge, Heatmap
- **4 KPI Cards** — Animated counters (Total Karyawan, Avg Kompensasi, Turnover Rate, Time-to-Fill)
- **Dark/Light Mode** — Toggle dengan animasi smooth
- **Glassmorphism** — Efek blur dan transparansi modern
- **Filter Interaktif** — Per tab: Departemen, Level, Lokasi, Status
- **Data Table** — Sortable, paginated, searchable
- **Responsive** — Desktop, tablet, mobile
- **500+ Data Dummy** — Generated client-side secara deterministik

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (with auto-reload)
npm run dev

# Start production server
npm start
```

Buka `http://localhost:3000` di browser.

## 🐳 Docker

```bash
# Build & run
docker-compose up --build

# Akses di http://localhost:8080
```

## ☁️ Vercel Deployment

Push ke GitHub, connect ke Vercel — konfigurasi sudah tersedia di `vercel.json`.

## 📁 Project Structure

```
├── api/
│   └── index.js              # Express server
├── public/
│   ├── index.html             # Main HTML (6 tab)
│   ├── style.css              # Design system
│   ├── logo.png               # AZ Tech logo
│   └── js/
│       ├── main.js            # Entry point
│       ├── state.js           # Global state
│       ├── config.js          # Theme & chart config
│       ├── utils.js           # Helpers
│       ├── filters.js         # Filter population
│       ├── dummyData.js       # Data generator (500+ records)
│       ├── charts/
│       │   ├── overviewCharts.js
│       │   ├── compensationCharts.js
│       │   ├── turnoverCharts.js
│       │   ├── recruitmentCharts.js
│       │   └── performanceCharts.js
│       └── components/
│           └── dataTable.js
├── Dockerfile
├── docker-compose.yml
├── vercel.json
├── package.json
└── README.md
```
