# AGENTS.md — Futsal Court Booking System (FCFS)

## Dev commands

| Package | Dev | Build | Lint |
|---------|-----|-------|------|
| `backend/` | `npm run dev` (nodemon) | `npm run build` (tsc) | none |
| `frontend/` | `npm run dev` (vite) | `npm run build` (tsc -b && vite build) | `npm run lint` (eslint) |

Run each from its own directory. No root package.json or monorepo tool.

## Architecture

- **Backend** (`backend/`) — Express 5 + TypeScript, Prisma ORM, MySQL. Entry: `src/server.ts` (:5000).
- **Frontend** (`frontend/`) — React 19 + Vite + Tailwind v4 (TailAdmin template). Entry: `src/main.tsx` → `App.tsx` (:5173).
- JWT auth via httpOnly cookie (`token`), fallback Bearer header. Role stored in `localStorage`.
- Backend emits CommonJS; frontend is ESM (`"type": "module"`).

## Key gotchas

- **No tests** exist (no test framework configured in either package).
- **No CI/CD** config.
- **Passwords are plaintext** — `bcrypt` is listed in deps but never called.
- `.env` is **tracked in git** (contains real DB/JWT secrets).
- `backend/src/controllers/data/data.ts` handles **court CRUD** (not generic data).
- **Booking flow (FCFS + Payment):** `bookingController.ts` creates `LOCKED` status with `lock_expires_at = +15min`. User must pay DP (50%) or FULL within lock window via `confirmPayment`. Expired locks auto-release to `CANCELLED`. Race condition via Prisma `$transaction` returns 409 on conflict.
- **Booking statuses:** `LOCKED` (menunggu bayar), `DP` (uang muka dibayar), `CONFIRMED` (lunas), `CANCELLED`, `PENDING` (legacy).
- **Operating hours:** 09:00–22:00, last start at 21:00 (1h max). Enforced in backend.
- **Schedule display:** `GET /api/data/getCourtSchedule?courtId=X&date=YYYY-MM-DD` returns non-CANCELLED bookings for that court+date. Used by `BookingModal.tsx` left panel.
- **Frontend modal flow:** `BookingModal.tsx` has two steps — `"form"` (schedule left + booking form right) then `"payment"` (countdown timer + DP/FULL choice). Payment view rendered inline in same component.
- `test-race.js` at root fires simultaneous booking requests to verify race handling.
- Backend has no linter/formatter; frontend has ESLint (flat config) but no Prettier.
- `backend/.env-local` is a placeholder; the active `.env` is used.
- Prisma schema at `backend/prisma/schema.prisma` — run `prisma generate` after schema changes, `prisma db push` to sync DB.

## Prerequisites

- MySQL running on `localhost:3306`, database `futsal_court_booking_system`.
- Seed data in `backend/database/futsal_court_booking_system.sql`.
- Node.js with npm in both `backend/` and `frontend/`.
