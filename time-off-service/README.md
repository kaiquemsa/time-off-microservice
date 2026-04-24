# Time-Off Service

Production-style backend case implementation for a **Time-Off microservice** that keeps leave balances consistent between an internal product and an external HCM source of truth.

## Executive Summary

This service solves three core problems:

1. **Balance integrity** per employee and location
2. **Request lifecycle management** (create, approve, reject)
3. **Cross-system synchronization** with HCM (realtime and batch)

The implementation includes:

- NestJS modular architecture
- SQLite + Prisma-backed persistence
- JWT authentication + role-based access control
- Admin-only approval action
- Seeded admin user for immediate demo usage

## Scope Delivered

### Core domains

- `Balance`: available, reserved, and used leave values
- `TimeOffRequest`: request lifecycle and sync state
- `User`: authentication and role authorization

### Security

- JWT-protected API by default
- Public endpoints only where explicitly marked
- Role guard enforcing `ADMIN` for approval endpoint

### Integration-facing capabilities

- Realtime balance sync endpoint
- Batch balance sync endpoint
- Request sync-result callback endpoint

## Architecture Overview

```text
Client / Frontend
      |
      v
NestJS API
  ├─ Auth Module (JWT, Roles)
  ├─ Balances Module
  ├─ Time-Off Requests Module
  ├─ HCM Integration Module
  └─ Prisma Module
          |
          v
       SQLite
```

## Business Workflow (End-to-End)

1. Create or update balance for `employeeId + locationId`
2. Create a time-off request
3. System reserves requested days from balance
4. Manager/Admin decides request:
   - Approve: reserved -> used and available decreases
   - Reject: reserved is released
5. HCM synchronization updates request sync status

## Tech Stack

- **Framework**: NestJS 11
- **Database**: SQLite
- **ORM/DB Access**: Prisma 7 + `better-sqlite3` adapter
- **Auth**: `@nestjs/jwt`, `passport-jwt`
- **Validation**: class-validator + global ValidationPipe

## Project Structure

```text
time-off-service/
  src/
    auth/
    balances/
    time-off-requests/
    hcm-integration/
    prisma/
    main.ts
  prisma/
    schema.prisma
    migrations/
    seed.ts
  docs/
    ENGINEERING_DECISIONS.md
```

## Getting Started

## 1. Prerequisites

- Node.js `>= 20.19` (recommended for Prisma 7 tooling)
- npm

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

## 4. Prepare database

If needed, run migrations and client generation:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 5. Seed users

```bash
npm run prisma:seed
```

Default seeded users:

- `admin / admin1234` (role `ADMIN`)
- `user / user1234` (role `USER`)

## 6. Run service

```bash
npm run start
```

Dev mode:

```bash
npm run start:dev
```

## Environment Variables

See [.env.example](/Users/kaiquesilva/Documents/project_hcm/time-off-service/.env.example).

Key values:

- `DATABASE_URL`: SQLite location
- `JWT_SECRET`: JWT signing key
- `JWT_EXPIRES_IN`: token TTL
- `ADMIN_SEED_*`, `USER_SEED_*`: seed credentials

## Authentication and Access Control

### Public endpoints

- `GET /`
- `POST /auth/login`

### Authenticated endpoints

All remaining endpoints require `Authorization: Bearer <token>`.

### Admin-only endpoint

- `PATCH /time-off-requests/:requestId/approve`

## API Endpoints

## Base

- `GET /`

## Auth

- `POST /auth/login`
- `POST /auth/me`

## Balances

- `GET /balances/:employeeId/:locationId`
- `PUT /balances/:employeeId/:locationId`

## Time-Off Requests

- `POST /time-off-requests`
- `GET /time-off-requests`
- `PATCH /time-off-requests/:requestId/approve` (`ADMIN` only)
- `PATCH /time-off-requests/:requestId/reject`

## HCM Integration

- `POST /hcm-integration/balances/realtime`
- `POST /hcm-integration/balances/batch`
- `POST /hcm-integration/requests/:requestId/sync-result`

## Quick API Usage

### 1. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}'
```

### 2. Create/Update balance

```bash
curl -X PUT http://localhost:3000/balances/emp-1/loc-1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"availableBalance": 10}'
```

### 3. Create request

```bash
curl -X POST http://localhost:3000/time-off-requests \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId":"emp-1",
    "locationId":"loc-1",
    "startDate":"2026-05-01",
    "endDate":"2026-05-02",
    "requestedDays":2
  }'
```

## Scripts

```bash
npm run build
npm run test
npm run test:e2e
npm run test:cov
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Test Execution and Validation

Run all backend validations with:

```bash
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

What each command validates:

- `npm run build`: TypeScript/Nest compile validation.
- `npm run test`: unit/service/controller/module/guard/strategy tests.
- `npm run test:e2e`: HTTP integration flow tests with real Nest app + SQLite test database.
- `npm run test:cov`: coverage report and regression baseline.

## Current Test Proof (Snapshot)

Latest verified snapshot (April 24, 2026):

- `npm run test`:
  - `17` suites passed
  - `47` tests passed
- `npm run test:e2e`:
  - `2` suites passed
  - `6` tests passed
- `npm run test:cov`:
  - Statements: `94.78%`
  - Branches: `77.83%`
  - Functions: `81.81%`
  - Lines: `94.06%`

Coverage artifacts are generated under `coverage/` (including lcov/html reports).

## Quality and Validation

- Project compiles with `npm run build`
- Automated unit and e2e tests pass
- DTO validation enabled globally (`whitelist`, `transform`, `forbidNonWhitelisted`)

## CORS

- Development: allows `localhost`/`127.0.0.1` on any port
- Production: strict policy (non-localhost origins blocked by current rule)

## Notes for Recruiter / Reviewer

- The solution prioritizes correctness of leave balance transitions and secure approval controls.
- Endpoints were designed to support both user-facing operations and HCM integration workflows.
- Additional engineering notes, trade-offs, and next steps are documented in:
  - [ENGINEERING_DECISIONS.md](/Users/kaiquesilva/Documents/project_hcm/time-off-service/docs/ENGINEERING_DECISIONS.md)
