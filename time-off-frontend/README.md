# Time-Off Frontend (Demo)

This frontend is a **simple visual demonstration** of the Time-Off backend challenge.
It is designed to simulate a real operational interface (dashboard, balances, requests, and HCM sync) while keeping implementation scope intentionally lightweight.

## Purpose

- Provide a clean UI to manually test backend flows.
- Demonstrate the end-to-end user journey: balance lookup, request lifecycle, approval/rejection, and HCM sync.
- Support a hiring-case presentation with a realistic navigation and layout.

## Important Scope Note

This project is **not** intended to be a production-ready frontend.
It is a practical UI layer for demonstration and backend validation.

Examples of intentional simplifications:
- Minimal client-side state management.
- No full design system or component library.
- Basic form UX for some actions (for example rejection reason prompt).
- Limited role-aware rendering (backend remains the source of truth for authorization).

## Tech Stack

- Next.js (App Router)
- React
- Plain CSS (`app/globals.css`)
- `lucide-react` icons
- HTTP client based on `fetch`

## Features

- Login screen with JWT session storage.
- Route guard for protected pages.
- Sidebar-based app shell and top header.
- Dashboard with process overview and quick actions.
- Balances page for employee/location lookup.
- Requests page with filters and decision actions:
  - Approve request
  - Reject request (with required reason)
- HCM Sync page:
  - Realtime sync
  - Batch sync
  - Sync-result callback

## Authentication and Authorization Behavior

- Unauthenticated users are redirected to `/login`.
- After login, access token and user info are stored in `localStorage`.
- Protected routes validate session via backend `/auth/me`.
- Backend enforces roles (for example, approve endpoints require `ADMIN`).

## Prerequisites

- Node.js 18+
- Backend API running (default: `http://localhost:3000`)

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

If not set, the frontend falls back to `http://localhost:3000`.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev -- -p 3001
```

3. Open:

- `http://localhost:3001/login`

## Build

```bash
npm run build
npm run start
```

## Navigation Map

- `/login` → Authentication screen
- `/dashboard` → Operational overview
- `/balances` → Balance lookup
- `/requests` → Request list and decision actions
- `/hcm` → Sync operations

## Project Structure

```text
app/
  layout.js
  page.js
  globals.css
  login/page.js
  (platform)/
    layout.js
    dashboard/page.js
    balances/page.js
    requests/page.js
    hcm/page.js

src/
  modules/
    auth/
      pages/
      services/
    dashboard/
      pages/
    balances/
      pages/
      services/
    requests/
      pages/
      services/
    hcm/
      pages/
      services/

  shared/
    auth/
    components/
    constants/
    services/
```

## Backend Contract (Expected)

This frontend expects the backend endpoints implemented in the challenge, including:

- `POST /auth/login`
- `POST /auth/me`
- `GET /balances/:employeeId/:locationId`
- `GET /time-off-requests`
- `POST /time-off-requests`
- `PATCH /time-off-requests/:requestId/approve`
- `PATCH /time-off-requests/:requestId/reject`
- `POST /hcm-integration/realtime-balance-sync`
- `POST /hcm-integration/batch-sync-balances`
- `POST /hcm-integration/time-off-requests/:requestId/sync-result`

## Demo Credentials

Use the seeded backend user(s), for example:

- Admin user created by backend seed script

## Final Note

This frontend focuses on clarity and flow demonstration for the challenge delivery.
For production usage, the next step would be strengthening UX details, form workflows, role-aware UI permissions, error handling standards, and test coverage.
