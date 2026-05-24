# SentinelX SOC Dashboard

The web-based Security Operations Center (SOC) dashboard for the SentinelX enterprise-grade SIEM platform. This dashboard provides real-time threat monitoring, security analytics, log correlation tables, and risk scores.

Built using **React 19**, **Vite 8**, **TailwindCSS 4**, and **Recharts**.

---

## Core Features

* **Real-time Security Alerts**: High-severity threat alerts (e.g., SSH brute force, web endpoint scanning) streamed instantaneously via secure WebSockets.
* **Aggregated Telemetry**: Visual dashboards presenting traffic histograms, status code distributions, and top requested paths.
* **Attacker Profiling**: Interactive leaderboards sorting malicious hosts by risk score, event frequency, and active suppression state.
* **Optimized Rendering**: Throttled WebSocket state updates (1-second batch updates) preventing main-thread blocking under high-volume log bursts.

---

## Technology Stack

* **Core**: React 19 (Functional Components & Hooks)
* **Build Tooling**: Vite 8 (Hot Module Replacement & Rollup-based bundling)
* **Styling**: TailwindCSS 4 & Framer Motion (Smooth page transitions & alert animations)
* **Charts**: Recharts (Responsive, interactive SVG charts)
* **Iconography**: Lucide React

---

## Development Setup

### Prerequisites
* **Node.js**: `18.0.0` or higher (LTS recommended)
* **npm**: `9.0.0` or higher

### 1. Install Dependencies
Navigate to the frontend directory and install the packages:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `frontend/` directory (or rely on default fallbacks):
```env
# REST API Endpoint for Ingestion-Service queries
VITE_API_URL=http://localhost:8080

# WebSocket Endpoint for streaming real-time alerts
VITE_WS_URL=ws://localhost:8080/ws
```

### 3. Run Development Server
Start the local server with hot reloading enabled:
```bash
npm run dev
```
The dashboard will be available at [http://localhost:5173](http://localhost:5173).

### 4. Code Quality & Linting
Run ESLint to check for stylistic errors or unused variables:
```bash
npm run lint
```

### 5. Production Compilation
Build and preview the optimized static bundle:
```bash
# Compile project to dist/
npm run build

# Host the compiled bundle locally for verification
npm run preview
```

---

## Project Structure

```text
frontend/
├── package.json          # Dependency definition and scripts
├── vite.config.js        # Vite configuration & plugin register
├── eslint.config.js      # ESLint code styling configuration
├── index.html            # Static entrypoint
└── src/
    ├── main.jsx          # React initialization mount
    ├── App.jsx           # Root layout, websocket connection hub, & analytics routers
    ├── App.css           # Styling overrides and layouts
    ├── index.css         # Tailwind directives and CSS variables
    └── assets/           # Static images, icons, and logos
```

---

## Key Development Guidelines

1. **State Batching**: All incoming WebSocket payloads must be accumulated in a buffer and flushed to the state once per second. Direct state updates per network packet can crash the browser during a DDoS simulation.
2. **Component Isolation**: Reusable dashboard components (charts, status widgets, tables) should be isolated in separate files and communicate strictly via props or lightweight context.
3. **Element Naming**: For automated end-to-end testing, ensure all interactive buttons, inputs, and tab navigation links have unique and descriptive `id` attributes.
4. **Theme Alignment**: Rely strictly on the dark-mode theme variables configured inside [index.css](file:///c:/Users/vaish/siem/frontend/src/index.css) to preserve visual consistency across widgets.
