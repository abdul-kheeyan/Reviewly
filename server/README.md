# ⚙️ Reviewly Backend Server & AI Engine

The **Reviewly** backend is an Express.js RESTful API and intelligent code analysis engine built with **Node.js (ES Modules)**, **Mongoose ODM (MongoDB)**, and **Google Gemini 2.0 Flash**. It handles authentication, repository synchronization via the GitHub API, webhook-triggered automated PR reviews, and a hybrid AI + Heuristic static analysis engine.

---

## 🏗️ Architecture & Core Components

```
server/
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.js   # User registration, login, token refresh, and profiles
│   │   ├── explainerController.js # AI codebase explanation & architecture mapping
│   │   ├── bugController.js    # Bug detection & vulnerability scanning
│   │   ├── qualityController.js# Quality score, security, and dependency endpoints
│   │   ├── repoController.js   # Repository CRUD & GitHub sync
│   │   ├── prController.js     # Pull request analysis & comment generation
│   │   └── copilotController.js# In-line AI suggestions
│   ├── middleware/
│   │   ├── auth.js             # JWT bearer verification middleware
│   │   ├── rateLimiter.js      # Endpoint rate-limiting
│   │   └── webhook.js          # GitHub HMAC SHA-256 signature verification
│   ├── models/
│   │   ├── User.js             # User account schema with password hashing
│   │   ├── Repo.js             # Repository schema with embedded cached analysis
│   │   ├── BugReport.js        # Persisted bug inspection records
│   │   ├── PullRequest.js      # PR metadata and status
│   │   └── Review.js           # Automated PR code review findings
│   ├── routes/
│   │   ├── ai.js               # Analysis endpoints (/api/analysis/*)
│   │   ├── auth.js             # Auth endpoints (/api/auth/*)
│   │   ├── repo.js             # Repository endpoints (/api/repos/*)
│   │   ├── pr.js               # Pull request endpoints (/api/prs/*)
│   │   └── webhook.js          # GitHub webhook receiver (/api/webhooks/github)
│   ├── services/
│   │   ├── aiService.js        # Gemini 2.0 Flash integration + Dynamic Heuristic Engine
│   │   ├── repoService.js      # Octokit GitHub repository tree & file loader
│   │   └── copilotService.js   # Automated line-level PR reviewer
│   ├── utils/                  # Logging, error formatting & helpers
│   ├── app.js                  # Express middleware configuration & route binding
│   └── index.js                # Server entry point
├── package.json
└── README.md
```

---

## 🧠 Hybrid AI & Static Heuristic Engine (`aiService.js`)

Reviewly features a robust dual-layer code analysis architecture:

1. **Google Gemini 2.0 Flash AI Layer**:
   - Analyzes repository trees, code snippets, manifests, and documentation using structured JSON prompts.
   - Generates in-depth architectural explanations, detects subtle logic flaws, and calculates security ratings.

2. **Dynamic Heuristic Static Code Analyzer (Fallback Engine)**:
   - Evaluates code even if external AI APIs are offline, rate-limited, or unconfigured.
   - Inspects real file extensions (`.html`, `.css`, `.js`, `.py`, `.java`, `.go`, `.rs`, `.php`, `.cpp`).
   - Identifies technology stacks dynamically (e.g., distinguishing pure HTML5/CSS/Vanilla JS from React or Python backends).
   - Generates accurate, tailored reports based on real file contents, eliminating generic mock responses.

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive access + refresh tokens | No |
| `POST` | `/api/auth/refresh` | Exchange refresh token for a new access token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user details | Yes |

### 📂 Repository Management (`/api/repos`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/repos` | List all repositories added by current user | Yes |
| `POST` | `/api/repos` | Connect a new GitHub repository | Yes |
| `GET` | `/api/repos/:id` | Fetch repository details and analysis status | Yes |
| `DELETE` | `/api/repos/:id` | Disconnect repository | Yes |

### 🔬 Repository Analysis & AI (`/api/analysis`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` / `GET` | `/api/analysis/:repoId/explain` | Generate / Fetch AI Codebase Explanation |
| `POST` / `GET` | `/api/analysis/:repoId/bugs` | Generate / Fetch Bug Detection Report |
| `POST` / `GET` | `/api/analysis/:repoId/quality-score` | Generate / Fetch 100-pt Code Quality Score |
| `POST` / `GET` | `/api/analysis/:repoId/security-scan` | Generate / Fetch Security & Vulnerability Scan |
| `POST` / `GET` | `/api/analysis/:repoId/dependencies` | Generate / Fetch Dependency & Package Analysis |

### 🪝 Webhooks (`/api/webhooks`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/webhooks/github` | GitHub Webhook receiver for automated PR review comments |

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0+
- **MongoDB**: v5.0+ (Local MongoDB instance or MongoDB Atlas URI)

### 2. Environment Variables

Create a `.env` file in the `server` folder:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/reviewly
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
CLIENT_URL=http://localhost:5173

# Optional: GitHub API Token (Increases rate limits for public repo inspection)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Optional: GitHub Webhook Secret for HMAC SHA-256 verification
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Optional: Google Gemini AI API Key (from Google AI Studio)
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here
```

### 3. Installation & Start

```bash
# Install dependencies
npm install

# Start in development mode (with nodemon auto-restart)
npm run dev

# Start in production mode
npm start
```
