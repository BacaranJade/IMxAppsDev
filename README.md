# School Maintenance Request System

A React + TypeScript app with a mascot auth flow (Log in / Register /
Forgot password) gating two separate dashboards: one for students, one for
admins.

## Why two dashboards

Students and admins need different things, so instead of one component with
a bunch of `if (isAdmin)` branches, the app has two small, independent
dashboard components that each do one job:

- **`StudentDashboard`** — submit a request, see only *your own* requests,
  status shown as a read-only badge.
- **`AdminDashboard`** — see *every* request school-wide, change any
  request's status, no submission form (admins manage, they don't file).

Both are built from the same shared pieces in `src/components/shared/`, so
there's one `RequestCard` (it just takes an optional `onStatusChange` — pass
it for the editable admin view, omit it for the student's read-only view),
one stats calculator, one filter/sort helper, and one header. Fixing a bug
or restyling a badge means editing it once, not twice.

## Logging in (demo only — no backend yet)

There's no real authentication. `App.tsx` fakes it:

- **Register** asks for a Student ID and "verifies" it against a hardcoded
  list in `src/data/enrolledStudents.ts`. Try `S-2024-0001` (valid) vs.
  anything else (rejected). Registering always creates a **student**
  account.
- **Log in** with any email containing "admin" (e.g. `admin@school.edu`) to
  land on the **admin** dashboard; any other email + a 4+ character password
  logs you in as a **student**.

## What's inside

```
src/
  auth/
    Login.tsx       # Login / Register (+ Student ID) / Forgot password
    Login.css
  components/
    StudentDashboard.tsx    # Submit + view own requests
    AdminDashboard.tsx      # View + manage every request
    shared/
      DashboardHeader.tsx   # Brand, user email, role badge, logout
      StatsBar.tsx          # Total / Open / In Progress / Resolved cards
      RequestCard.tsx       # One request; editable or read-only status
      RequestFormModal.tsx  # "New request" form with photo upload
      requestUtils.ts       # computeStats() + filterRequests()
      dashboard-shared.css  # Styles shared by both dashboards
  data/
    mockRequests.ts         # Seed request data
    enrolledStudents.ts     # Mock enrollment list for ID verification
  types.ts                  # Shared TypeScript types
  App.tsx                   # Auth state, request state, role-based routing
  App.css                   # Design tokens + global styles
  main.tsx                  # Entry point
```

## Running it

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Building for production

```bash
npm run build
npm run preview
```

## Wiring up a real backend (e.g. Laravel)

Everything fake lives in `App.tsx`: `handleLogin`, `handleRegister`, and the
`inferRole` helper. Replace those with real API calls (login, register +
server-side student ID check, and a `role` the server returns), swap
`mockRequests` for a `GET /api/requests` fetch, and point
`handleCreateRequest` / `handleStatusChange` at `POST`/`PATCH` endpoints. None
of the dashboard or shared components need to change for that.
