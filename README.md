# Reviewly — AI-Powered Code Review Assistant (MERN, plain JavaScript)

MongoDB + Express + React + Node.js. No TypeScript, no Docker — just `npm install`
and `npm run dev` in each folder.

## Stack
- **client/** — React 18 + Vite + Tailwind CSS (JavaScript, .jsx)
- **server/** — Node.js + Express (JavaScript, .js)
- MongoDB via Mongoose

## Setup

```bash
# 1. env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 2. install
cd server && npm install
cd ../client && npm install

# 3. make sure MongoDB is running locally, e.g.
mongod --dbpath ./data

# 4. run both (two terminals)
cd server && npm run dev      # http://localhost:4000
cd client && npm run dev      # http://localhost:5173
```

## Auth model

The landing page (`/`) is fully public — nobody is redirected to a login screen
just for visiting. A sign-in modal only opens when someone takes an action that
needs an account: "Sign in", "Connect a repository", or hitting `/dashboard`
directly. See `client/src/components/ProtectedRoute.jsx`.

## GitHub webhook

`POST /api/webhooks/github` verifies the `X-Hub-Signature-256` header with HMAC
SHA-256 against `GITHUB_WEBHOOK_SECRET` before touching the payload.
See `server/src/middleware/webhook.js`.

## What's stubbed (build on top of this)

- `services/copilotService.js` returns mock suggestions — swap in a real call to
  GitHub Copilot / Azure OpenAI where marked `TODO`.
- No background job queue — webhook events call the review service inline.
  Fine for a demo, swap in Bull + Redis before real PR volume.
- `routes/auth.js` issues a JWT from a stub GitHub profile — replace with a real
  GitHub OAuth code exchange.
