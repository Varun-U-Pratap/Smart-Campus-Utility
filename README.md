# Smart Campus Utility

Smart Campus Utility is a full-stack campus operations platform for issues, announcements, bookings, and role-based dashboards.

Live deployment: https://smart-campus-utility.vercel.app/

## Stack

- Frontend: React, Tailwind CSS, Framer Motion, Lucide, Vite
- Backend: NestJS, Socket.IO, Prisma
- Database: PostgreSQL on Neon
- Deployment: Vercel for the frontend, Render for the API, Neon for the database
- Auth: JWT with role-based access control for student and admin flows

## What It Does

- Auth: `POST /auth/register`, `POST /auth/login`
- User Profile: `GET /users/me`
- Issue Tracking:
  - `POST /issues` for students
  - `GET /issues` for admins
  - `GET /issues/mine` for students
  - `PATCH /issues/:id/status` for admin workflow
- Announcements:
  - `GET /announcements/feed`
  - `POST /announcements` for admins
  - `POST /announcements/:id/read`
- Booking:
  - `GET /bookings/rooms`
  - `GET /bookings/grid`
  - `POST /bookings`
  - `PATCH /bookings/:id/status`

## Workspace Layout

- `backend/`: NestJS API, guards, realtime gateway, and domain modules
- `frontend/`: React dashboard app with role-specific screens and motion-driven UI
- `prisma/schema.prisma`: canonical database schema
- `docs/system-architecture.mmd`: Mermaid architecture diagram

## Secret-Safe Setup

This repo is prepared to stay GitHub-safe: secrets stay local, env examples are committed, and real credentials are ignored by Git.

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create local env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Fill in your local values, especially `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` in `backend/.env`.

4. Generate the Prisma client:

```bash
npx prisma generate --schema prisma/schema.prisma
```

## Run Locally

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

## Build And Test

```bash
npm run build
npm run test
```

## Deployment Notes

- Frontend is deployed on Vercel.
- Backend API is deployed on Render.
- PostgreSQL is hosted on Neon.
- The live app URL is https://smart-campus-utility.vercel.app/.

## Notes

- The API can start even if database credentials are invalid, but DB-backed endpoints will fail until the Neon connection strings are set correctly.
- Local development URLs:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`
