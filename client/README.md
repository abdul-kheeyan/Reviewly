# 🖥️ Reviewly Frontend Client

The frontend for **Reviewly** is a high-performance Single Page Application (SPA) built with **React 18**, **Vite**, and **Tailwind CSS**. It provides an intuitive, responsive dashboard for managing GitHub repositories, viewing real-time AI code reviews, inspecting security vulnerabilities, tracking code quality metrics, and reviewing pull request feedback.

---

## 📦 Tech Stack & Libraries

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) (configured with automatic JWT interceptors & token refresh)

---

## 📂 Directory Structure

```
client/
├── public/                 # Static public assets & icons
├── src/
│   ├── components/         # Reusable UI Components
│   │   ├── ui/             # Core atomic design elements (Buttons, Badges, Tabs, Cards)
│   │   ├── AddRepoModal.jsx# Modal to import GitHub repositories
│   │   ├── LoginModal.jsx  # Auth modal supporting Sign-in, Register & Guest mode
│   │   └── ProtectedRoute.jsx # Guard for authenticated views
│   ├── context/
│   │   └── AuthContext.jsx # Global Authentication state & session provider
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   └── api.js          # Pre-configured Axios instance with auto token refresh
│   ├── pages/
│   │   ├── LandingPage.jsx # Public landing & feature showcase
│   │   ├── DashboardPage.jsx # User repository catalog, global stats & quick actions
│   │   └── RepoDetailPage.jsx# 5-Tab deep analysis view (Explain, Bugs, Quality, Security, Dependencies)
│   ├── App.jsx             # Top-level routing & layout wrapper
│   ├── main.jsx            # React root mount point
│   └── index.css           # Global Tailwind stylesheet & animations
├── index.html              # Vite entry HTML
├── tailwind.config.js      # Tailwind theme configuration
├── vite.config.js          # Vite plugins & bundler settings
└── package.json
```

---

## 🌟 Key Application Views

### 1. Landing Page (`/`)
- Publicly accessible page explaining Reviewly's AI capabilities.
- Live feature highlights, code preview demos, interactive metrics, and call-to-actions.
- Opens the unified `LoginModal` without disrupting user navigation.

### 2. Dashboard (`/dashboard`)
- Displays overall account metrics: Total Repositories, Repos Analyzed, and Average Code Quality Score.
- Grid list of user-connected repositories with instant status indicators.
- Quick modal to connect new public or private GitHub repositories.

### 3. Repository Detail View (`/repos/:id`)
- **Tab 1: Explain Codebase** — Overview, Target Audience, Tech Stack badges, Key Files breakdown, and Architecture Summary.
- **Tab 2: Bug Analysis** — Detected edge-cases, syntax/logic risks, and suggested refactoring steps.
- **Tab 3: Quality Score** — 100-point maintainability rating, breakdown by categories, and best-practice recommendations.
- **Tab 4: Security Scan** — Vulnerability audit (Secrets, XSS/Injection, Insecure patterns) grouped by severity (`HIGH`, `MEDIUM`, `LOW`).
- **Tab 5: Dependencies** — Detected packages, CDN libraries, ecosystem versions, and upgrade recommendations.

---

## ⚙️ Setup & Configuration

### 1. Environment Configuration

Create a `.env` file in the `client` root:

```env
# URL pointing to the backend Express server
VITE_API_URL=http://localhost:4000/api
```

### 2. Installation

```bash
# Install NPM packages
npm install
```

### 3. Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server at `http://localhost:5173` |
| `npm run build` | Compiles and optimizes assets into `dist/` for production |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint checks across codebase |

---

## 🔒 Authentication Flow & HTTP Interceptors

1. **Tokens**: Access tokens are stored in memory/local state and dispatched in the `Authorization: Bearer <token>` header.
2. **Auto-Refresh**: `client/src/lib/api.js` intercepts `401 Unauthorized` responses, pauses pending requests, calls `POST /api/auth/refresh`, and transparently replays the failed requests upon receiving a new access token.
3. **Protected Routes**: `ProtectedRoute.jsx` ensures only authenticated sessions access `/dashboard` and `/repos/:id`.
