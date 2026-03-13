# Restaurant Analytics Platform

Monorepo-style setup with `frontend` (Next.js/TypeScript/Tailwind) and `backend` (Express/Prisma/PostgreSQL).

## Quickstart
- Install dependencies in each package:
  - `cd frontend && npm install`
  - `cd ../backend && npm install`
- Copy `.env.example` to `.env` in both folders and fill values.
- Run backend: `npm run dev` from `backend`.
- Run frontend: `npm run dev` from `frontend` (expects backend at `http://localhost:4000`).

## Project layout
- `frontend/` – Next.js dashboard with charts and API client.
- `backend/` – REST API, Prisma schema, analytics queries.

## Tech
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Chart.js via `react-chartjs-2`.
- Backend: Node.js 20, Express 5, Prisma ORM, PostgreSQL.
