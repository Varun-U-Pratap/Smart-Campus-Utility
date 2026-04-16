# Smart Campus Utility

A full-stack campus operations platform built with:

- Frontend: React + Tailwind CSS + Framer Motion + Lucide
- Backend: NestJS (modular architecture)
- Database: PostgreSQL via Prisma ORM
- Auth: JWT + Role-Based Access Control (Student/Admin)

## Workspace Structure

- `backend/`: NestJS API, RBAC, realtime gateway, core modules
- `frontend/`: React dashboard app with animated UX and role-specific flows
- `prisma/schema.prisma`: canonical database schema
- `docs/system-architecture.mmd`: Mermaid architecture diagram

## Implemented Modules

- Auth: `POST /auth/register`, `POST /auth/login`
- User Profile: `GET /users/me`
- Issue Tracker:
  - `POST /issues` (Student create)
  - `GET /issues` (Admin list)
  - `GET /issues/mine` (Student list)
  - `PATCH /issues/:id/status` (Admin workflow)
- Announcements:
  - `GET /announcements/feed`
  - `POST /announcements` (Admin publish)
  - `POST /announcements/:id/read`
- Booking:
  - `GET /bookings/rooms`
  - `GET /bookings/grid`
  - `POST /bookings`
  - `PATCH /bookings/:id/status`

## Frontend UX Highlights

- Vibrant light visual system (`#F8FAFC`, `#6366F1`, `#10B981`)
- Glassmorphism cards, soft shadows, high-contrast typography
- Framer Motion route/page transitions and staggered list animations
- Drag-to-update admin Kanban board
- Student issue reporting wizard
- Real-time announcements feed hooks via Socket.IO
- Booking grid with request and approval actions

## Setup

1. Install dependencies from root:

```bash
npm install
```

2. Configure backend env (copy and edit values):

```bash
cp backend/.env.example backend/.env
```

3. Ensure PostgreSQL is reachable with the `DATABASE_URL` in `backend/.env`.

4. Generate Prisma client:

```bash
npx prisma generate --schema prisma/schema.prisma
```

## Run

- Backend only:

```bash
npm run dev
```

- Frontend only:

```bash
npm run dev:web
```

- Both together:

```bash
npm run dev:all
```

## Build and Test

```bash
npm run build
npm run test
```

## Notes

- API server now starts even if DB credentials are invalid, but DB-backed endpoints will fail until PostgreSQL credentials are corrected.
- Current dev URLs:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`
