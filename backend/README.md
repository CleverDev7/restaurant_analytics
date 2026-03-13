# Backend (Express + PostgreSQL, JWT auth)

## Setup
1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev` (port 4000).

## Auth & tenancy
- Multi-tenant: every user has `restaurantId` and a role (ADMIN | MANAGER | STAFF).
- Endpoints:
  - `POST /api/auth/signup` → create restaurant + admin user, returns JWT.
  - `POST /api/auth/login` → returns JWT.
  - `POST /api/auth/invite` → create user (ADMIN or MANAGER only).
- Use `Authorization: Bearer <token>` for all protected routes; restaurant scoping enforced from token.

## API routes (protected unless noted)
- `GET /health` (public)
- Analytics: `/api/analytics/*`
- Orders: `POST/GET /api/orders`
- Menu items: `POST/GET /api/menu-items` (create requires ADMIN/MANAGER)
- Inventory: `POST/GET /api/inventory` (create requires ADMIN/MANAGER)

## Project structure
- `src/server.ts` – Express app wiring + schedulers
- `src/routes/*` – routes with auth guards
- `src/controllers/*` – handlers
- `src/services/*` – DB logic (raw SQL via pg)
- `src/jobs/scheduler.ts` – cron jobs for summaries
- `src/db/pool.ts` – PG pool helper
- `src/types` – shared types

## Notes
- Ensure DB tables exist (Restaurant, User, Staff, Customer, MenuItem, Order, OrderItem, InventoryPurchase, Shift, summary tables). Prisma is removed; manage schema via SQL.
