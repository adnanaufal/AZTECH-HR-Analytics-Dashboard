# AZ Tech — HR Analytics Mathical Neubrutalist Dashboard

An interactive, high-fidelity HR Analytics Dashboard built with a bold, mathematical-inspired neubrutalist design system. It visualizes key organizational metrics across compensation, benefits, turnover, recruitment, and performance management.

---

## 🎨 Design Philosophy & Visual System

This project deviates from generic dashboard designs by implementing a striking, premium **Mathical Neubrutalist UI**:
*   **Harmonious Color Palette:** Built using high-contrast, neubrutalist-specific colors: Electric Purple (`#5B42FF`), Bubblegum Pink (`#FF6BE5`), Sand Cream (`#E6E1B5`), and Electric Lime (`#D5F34A`) set against a deep zinc-black background (`#09090b`).
*   **Chunky Typography:** Features the bold display font **KaioTRIAL** (Super/Black/Bold weights) for titles, cards, and charts, establishing a fun, chunky, and math-like identity.
*   **Custom Iconography:** Sidebar navigation features custom **Streamline Pixel-Art** icons (`Business-Products-Data-File-Bars`, `Business-Products-Cash-User-Man-Message`, etc.) with dynamic color transitions (`fill="currentColor"`) matching the active menu states.
*   **Sticky Blurred Header:** The top-controls panel floats at the top of the content area (`position: sticky`) with a translucent background and **`backdrop-filter: blur(20px)`**, letting cards slide smoothly underneath.
*   **Refined Layout Spacing:** Removed cluttered Strategy/Utilities panels, replaced by a centralized, dynamic filter bar on the left side-by-side with a compact KPI ribbon on the right.

---

## 🚀 Key Features

*   **Real-time Filters:** Dynamically filter data (department, location, job level, source, exit reasons) with dropdowns styled in KaioTRIAL typography and high-contrast neubrutalist pop shadows.
*   **ECharts Visualizations:** Hand-crafted, theme-aware neubrutalist charts including bar composition stacks, pay gap grids, recruitment pipelines, and performance bell curves.
*   **Smooth Animations:** Staggered card entrance animations powered by **GSAP** (GreenSock) that trigger flawlessly across tab transitions.
*   **Dynamic Counting:** KPI ribbon values animate smoothly on load using **CountUp.js**.
*   **Responsive Layout:** Fully compatible with desktop, tablet, and mobile screens.

---

## 🛠️ Technologies Used

*   **Core:** Vanilla HTML5, CSS3, and ES6 JavaScript Modules.
*   **Visualizations:** Apache ECharts (v5.5.1).
*   **Animations:** GSAP (v3.12.5).
*   **Dynamic Metrices:** CountUp.js (v2.8.0).
*   **Icons:** Streamline Pixel Icons (Primary) & Lucide Icons (Fallback).

---

## 📂 Project Structure

```
├── api/
│   └── index.js                 # API and server routing
├── public/
│   ├── fonts/                   # KaioTRIAL font files
│   ├── js/
│   │   ├── charts/              # ECharts render modules
│   │   ├── components/          # Reusable UI components (data tables)
│   │   ├── config.js            # Theme and helper configs
│   │   ├── dummyData.js         # Dummy HR data generator
│   │   ├── filters.js           # Filter interaction listeners
│   │   ├── main.js              # Application core & tab controller
│   │   ├── state.js             # Shared state object
│   │   └── utils.js             # Utility & formatting helpers
│   ├── index.html               # Main dashboard document
│   ├── style.css                # Neubrutalist design system stylesheet
│   └── logo.png                 # AZ Tech branding logo
├── package.json
└── README.md
```

---

## 💻 Getting Started

### Option 1: Run Locally (Node.js)

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   👉 **`http://localhost:3001`**

### Option 2: Run with Docker (Recommended for Deployment)

You can run the dashboard in a containerized environment using Docker and Docker Compose:

1. **Build and Start Container:**
   ```bash
   docker compose up --build -d
   ```
   *This starts the container in detached mode on port `8080`.*

2. **Access the Dashboard:**
   Open your browser and navigate to:
   👉 **`http://localhost:8080`**

3. **Check Container Status:**
   ```bash
   docker compose ps
   ```

4. **Stop Container:**
   ```bash
   docker compose down
   ```
