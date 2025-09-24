# User Profile Manager

A small fullstack app demonstrating a clean TypeScript stack with a Node.js (Express) API and a React client. It implements email-only JWT login, profile view/update backed by an in-memory store, and GitHub public repos fetching with caching, plus basic security hardening.

## Quick Start

### Prerequisites
- Node.js 18+ (recommended 20+)

### 1) Server (API)

```bash
cd server
npm install
cp .env.example .env
# edit .env if desired (e.g. change JWT_SECRET, PORT)
npm run dev
```

By default the API starts on `http://localhost:4000` with base path `http://localhost:4000/api`.

### 2) Client (React)

```bash
cd client
npm install
# If your API runs on a non-default URL, set VITE_API_URL accordingly
echo "VITE_API_URL=http://localhost:4000/api" > .env.local
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

## API Endpoints

See `API.md` for details and examples.

Base URL: `http://localhost:4000/api`

- POST `/auth/login` – returns JWT for an email address
- GET `/profile` – returns current user's profile (requires Bearer token)
- PUT `/profile` – updates current user's `name` (requires Bearer token)
- GET `/github/repos?username=:username` – public GitHub repos for a user (cached)

## Architecture Overview

### Backend (Node.js, Express, TypeScript)
- `src/app.ts`: Express app wiring, middleware: JSON, CORS, Helmet, global rate limiting, health check, routers, error handler
- `src/routes/`: Feature routers
  - `auth.ts`: email-only login -> JWT (2h expiry)
  - `profile.ts`: GET/PUT profile, protected via JWT middleware
  - `github.ts`: fetch GitHub repos via `undici`, in-memory TTL cache
- `src/middleware/auth.ts`: Bearer token validation, attaches `userEmail` to request
- `src/db/memory.ts`: in-memory Map as a lightweight store for user profiles
- `src/utils/cache.ts`: simple TTL cache
- Validation: `zod` on inputs (server) and client-side schema for login
- Security: `helmet`, `cors` (credentials enabled), `express-rate-limit`

### Frontend (React, TypeScript, Vite)
- Pages
  - `LoginPage`: email login, client-side validation, saves JWT in localStorage
  - `ProfilePage`: loads and updates profile with Bearer token
  - `ReposPage`: fetches GitHub repos with optional sort by stars; shows loading/error states
- Routing: `react-router-dom`
- API client: `src/api/client.ts` wraps `fetch`, centralizes base URL and error handling
- State: local component state + `useLocalStorage` for token persistence

## Security & Performance Choices
- Helmet for secure headers
- CORS with credentials toggle (default allows all origins for dev; restrict in prod)
- Global rate limit (60 req/min) and room for per-route limits (e.g., GitHub)
- Input validation/sanitization with `zod` (server and client login)
- In-memory cache for GitHub responses (TTL 60s)

## Environment

Server environment variables (`server/.env`):

```
PORT=4000
JWT_SECRET=dev-secret
```

Client environment variables (`client/.env.local`):

```
VITE_API_URL=http://localhost:4000/api
```

## Testing

### Server
```bash
cd server
npm test
```

### Client
```bash
cd client
npm test
```

## API Docs / Postman
- See `API.md` for Markdown docs
- Import `postman_collection.json` into Postman to try endpoints quickly

## Notes & Trade-offs
- In-memory DB keeps the project lightweight; replace with a real DB for persistence
- JWT secret defaults to `dev-secret` for local runs – always override in production
- Global CORS is permissive for demo; restrict origins for deployments


