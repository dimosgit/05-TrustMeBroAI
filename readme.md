# TrustMeBroAI MVP

Production-ready MVP foundation for **TrustMeBroAI** with separated services from day one:

- `frontend`: React + Tailwind single-page guided wizard
- `backend`: Node.js + Express API
- `db`: PostgreSQL with schema + seed scripts
- Dockerized for local development and straightforward Coolify deployment

## Stack

- React (Vite) + Tailwind CSS
- Node.js (Express)
- PostgreSQL 16
- Docker + Docker Compose

## Project Structure

```
.
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── .env.example
├── backend/
│   ├── src/
│   ├── db/init/
│   │   ├── 001_schema.sql
│   │   └── 002_seed.sql
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

## MVP Features Implemented

1. Hero/landing section with premium SaaS styling
2. One-question-at-a-time wizard with progress indicator
3. Mock recommendation results state:
   - best match card
   - 2 alternatives
   - comparison table
   - recommendation explanation
4. Backend APIs:
   - `GET /api/tools`
   - `GET /api/tasks`
   - `GET /api/profiles`
   - `GET /api/priorities`
   - `POST /api/session`
   - `POST /api/recommendation` (placeholder logic)
5. PostgreSQL schema and seed data for all required core entities

## Database Model

Tables included:

- `tools`
- `profiles`
- `tasks`
- `priorities`
- `user_sessions`
- `recommendations`

The DB is intentionally separated so external scripts can update tools/scoring inputs independently from frontend logic.

## Seeded Tool Data

- ChatGPT
- Claude
- Microsoft Copilot
- Perplexity
- Cursor
- GitHub Copilot
- Zapier
- Make
- n8n

## Fastest Local Start (No Docker)

If Docker image pulls are blocked on your network, run the app without PostgreSQL using built-in mock mode.

Run this once from the project root:

```bash
npm run local
```

What it does automatically:

1. Installs backend dependencies
2. Installs frontend dependencies
3. Creates `backend/.env` and `frontend/.env` if missing
4. Sets `FRONTEND_ORIGIN=http://localhost:5174` and `USE_MOCK_DATA=true` in `backend/.env`
5. Starts backend and frontend together in the same terminal

Open:

- Frontend: [http://localhost:5174](http://localhost:5174)
- Backend health: [http://localhost:8080/api/health](http://localhost:8080/api/health)

## Local Development (Docker Compose)

1. Copy env template:

```bash
cp .env.example .env
```

2. Start all services:

```bash
docker compose up --build
```

3. Open:

- Frontend: [http://localhost:5174](http://localhost:5174)
- Backend: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- PostgreSQL: `localhost:5432`

To stop:

```bash
docker compose down
```

To reset DB completely:

```bash
docker compose down -v
```

## API Quick Reference

### GET `/api/tools`
Returns active tools from DB.

### GET `/api/tasks`
Returns wizard task options.

### GET `/api/profiles`
Returns wizard profile options.

### GET `/api/priorities`
Returns wizard priority options.

### POST `/api/session`
Creates a user session record.

Request body example:

```json
{
  "profile_id": 2,
  "task_id": 4,
  "budget": "Low cost",
  "experience_level": "Intermediate",
  "selected_priorities": ["Best quality", "Fastest results"]
}
```

### POST `/api/recommendation`
Returns mock recommendation based on placeholder logic and stores recommendation.

Request body example:

```json
{
  "user_session_id": 1
}
```

## Where to Plug In Real Algorithm Later

- File: `backend/src/recommendation.js`
- Function: `pickMockRecommendation(...)`

That function currently contains simple placeholder logic and a `TODO` marker. Replace it with your scoring/ranking engine.

## External Script Integration Path

Recommended integration approach for your later scripts:

1. Script reads/writes directly to `tools`, `tasks`, and future scoring tables in PostgreSQL.
2. Backend endpoint reads latest DB state and applies your scoring function.
3. Frontend remains thin and fast, only consuming API responses.

This keeps recommendation evolution independent from UI deployment.

## Coolify Deployment Notes

You can deploy either as:

1. Multi-service Docker Compose app using `docker-compose.prod.yml`, or
2. Three separate Coolify services (`frontend`, `backend`, `db`) using the provided Dockerfiles.

### Recommended env vars in Coolify

Backend:

- `NODE_ENV=production`
- `PORT=8080`
- `DATABASE_URL=postgresql://<user>:<password>@<db-host>:5432/<db-name>`
- `FRONTEND_ORIGIN=https://<your-frontend-domain>`

Frontend build arg/env:

- `VITE_API_BASE_URL=https://<your-backend-domain>/api`

Database:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## Performance and Simplicity Choices

- Minimal dependencies
- No auth/admin overhead yet
- One-page flow with lightweight transitions
- Server-side mock logic ready to swap with real algorithm
- Clean monorepo-style structure for maintainability
