# Technical Requirements Document (TRD)

## 1. Document Metadata

- Project: Time-Off Service
- Author: Kaique Silva
- Date: 2026-04-24
- Version: 1.0
- Status: Final (Take-home scope)

## 2. Executive Summary

This document defines the technical requirements and design for a Time-Off microservice that manages employee leave balances and request lifecycle while integrating with an HCM system that remains the source of truth for workforce data.

The key objective is **balance integrity** under asynchronous and potentially conflicting updates across two systems.

## 3. Product Context and Problem Statement

Employees submit leave requests through ExampleHR, while HCM controls authoritative HR records and can independently adjust balances (for example, anniversary grants or yearly resets).

Main challenge:

- A leave request must reserve and later consume balance safely.
- HCM may update balances in parallel.
- The service must remain defensive even when HCM feedback is delayed or partially unavailable.

## 4. Goals and Non-Goals

### 4.1 Goals

1. Provide API endpoints for balance management and time-off request lifecycle.
2. Preserve balance consistency (`available`, `reserved`, `used`) through transactional updates.
3. Support HCM sync in realtime and batch modes.
4. Enforce secure API access with JWT and role-based authorization.
5. Provide operationally simple local setup for evaluation.

### 4.2 Non-Goals (for this case scope)

1. Full enterprise IAM/SSO and refresh token workflows.
2. Advanced scheduling and business calendar logic (holidays, timezone complexity).
3. Event bus/outbox architecture for guaranteed distributed delivery.
4. Multi-tenant sharding and region-aware data partitioning.
5. UI/UX productization beyond a functional integration simulator.

## 5. Functional Requirements

### 5.1 Authentication and Authorization

1. API must issue JWT access tokens via login.
2. API must require JWT for protected endpoints.
3. API must enforce role-based authorization for sensitive actions.
4. Approving time-off requests must be restricted to `ADMIN` role.

### 5.2 Balance Management

1. API must retrieve balance by employee and location.
2. API must upsert balance for employee/location pair.
3. API must expose effective available amount (`available - reserved`).
4. API should support optimistic version checks where applicable.

### 5.3 Request Lifecycle

1. API must create time-off request with date range and requested days.
2. On creation, service must reserve days atomically from balance.
3. API must list requests with optional filters.
4. API must approve pending requests and consume reserved days.
5. API must reject pending requests and release reserved days.

### 5.4 HCM Integration

1. API must accept realtime balance updates from HCM.
2. API must accept batch balance updates from HCM.
3. API must accept sync-result callbacks per request and update sync status.

## 6. Non-Functional Requirements

1. Data consistency: transactionally safe updates for request + balance mutations.
2. Security: JWT auth and RBAC for approval action.
3. Maintainability: modular NestJS codebase with clear domain boundaries.
4. Testability: unit-level confidence and deterministic local setup.
5. Simplicity: low-friction local execution for interview review.

## 7. Domain Model

### 7.1 Balance

- `employeeId + locationId` uniquely identify a balance bucket.
- `availableBalance`: total available leave.
- `reservedBalance`: temporary hold for pending requests.
- `usedBalance`: consumed leave after approval.
- `version`: optimistic concurrency helper.

### 7.2 TimeOffRequest

- Captures employee, location, date range, and requested days.
- Business statuses: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
- Sync statuses: `NOT_SYNCED`, `SYNCED`, `FAILED`.

### 7.3 User

- `username`, `passwordHash`, `role` (`ADMIN`, `USER`).
- Seeded baseline users for evaluator reproducibility.

## 8. API Contract (Implemented)

### Public

- `GET /`
- `POST /auth/login`

### Authenticated

- `POST /auth/me`
- `GET /balances/:employeeId/:locationId`
- `PUT /balances/:employeeId/:locationId`
- `POST /time-off-requests`
- `GET /time-off-requests`
- `PATCH /time-off-requests/:requestId/reject`
- `POST /hcm-integration/balances/realtime`
- `POST /hcm-integration/balances/batch`
- `POST /hcm-integration/requests/:requestId/sync-result`

### Admin-only

- `PATCH /time-off-requests/:requestId/approve`

## 9. Core Business Flows

### 9.1 Create Request

1. Validate payload.
2. Load `Balance` by employee/location.
3. Compute effective available (`available - reserved`).
4. If insufficient, reject.
5. Reserve requested days and create request (`PENDING`) in one transaction.

### 9.2 Approve Request

1. Ensure request exists and is `PENDING`.
2. Ensure requester has `ADMIN` role.
3. Decrement reserved, increment used, decrement available.
4. Mark request as `APPROVED` and `NOT_SYNCED`.

### 9.3 Reject Request

1. Ensure request exists and is `PENDING`.
2. Decrement reserved.
3. Mark request as `REJECTED` with reason and `NOT_SYNCED`.

### 9.4 HCM Sync Result

1. Receive callback for request id.
2. Mark `SYNCED` on success.
3. Mark `FAILED` on error and persist error message when provided.

## 10. Data Consistency Strategy

1. Use database transactions for operations that mutate both request and balance.
2. Keep reserved days explicit to avoid race conditions between creation and decision.
3. Use status checks (`PENDING` gate) to prevent invalid repeated decisions.
4. Track `version` and allow optimistic checks in balance updates.

## 11. Security Design

1. JWT strategy validates bearer token and resolves user identity.
2. Global auth guard applies secure-by-default policy.
3. `@Public()` explicitly marks unauthenticated endpoints.
4. Roles guard enforces action-level authorization.
5. Passwords are hashed (`bcryptjs`) in seed and validated with compare.

## 12. Error Handling and Defensive Rules

1. Reject invalid request date ranges.
2. Reject insufficient balances on request creation.
3. Reject approval/rejection when request is not `PENDING`.
4. Return authorization errors for insufficient role.
5. Validate all DTOs via global validation pipe.

## 13. CORS and Client Integration

1. Development mode allows any `localhost`/`127.0.0.1` origin with any port.
2. Production mode currently enforces strict origin rule (hardened baseline).

## 14. Setup and Operations

### 14.1 Local Setup

```bash
npm install
npm run prisma:seed
npm run start
```

### 14.2 Seeded Users

- Admin: `admin / admin1234`
- User: `user / user1234`

### 14.3 Environment Variables

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_SEED_USERNAME`, `ADMIN_SEED_PASSWORD`
- `USER_SEED_USERNAME`, `USER_SEED_PASSWORD`

## 15. Alternatives Considered

### 15.1 Direct decrement on request creation (no reserved balance)

- Pros: simpler model.
- Cons: weak visibility during approval workflow and harder rollback semantics.
- Decision: rejected in favor of explicit reserve/consume model.

### 15.2 Event-driven integration as default

- Pros: better decoupling and async resilience.
- Cons: larger operational overhead for case scope.
- Decision: rejected for take-home simplicity; endpoints kept integration-ready.

### 15.3 Full RBAC policy engine

- Pros: scalable enterprise authorization model.
- Cons: unnecessary complexity for current requirements.
- Decision: simple role metadata and guard.

## 16. Risks and Mitigations

1. Risk: HCM callback delay or failure.
   - Mitigation: explicit `syncStatus` and error capture.
2. Risk: concurrent updates on same balance.
   - Mitigation: transactions + reserved model + version support.
3. Risk: token misuse in shared environments.
   - Mitigation: secretized JWT config and role checks on critical path.

## 17. Observability and Operational Gaps

Current:

- Framework-level logs and clear error responses.

Recommended next:

1. Structured logging with correlation IDs.
2. Request audit trail (especially approval/rejection actor and timestamp).
3. Metrics for failed sync callbacks and approval latency.

## 18. Test Strategy and Evidence

### 18.1 Automated Test Layers

1. Unit/service tests for core business rules:
   - request creation, approval, rejection transitions
   - balance version conflict behavior
   - HCM sync status updates
2. Security tests:
   - auth login success/failure
   - JWT guard behavior (`@Public` vs protected)
   - role guard enforcement for restricted actions
   - JWT strategy validation for valid/invalid principals
3. Bootstrap/runtime tests:
   - `main.ts` CORS and validation-pipe bootstrap behavior
4. E2E integration tests:
   - full login + token usage
   - request lifecycle with balance mutations
   - RBAC check (`USER` denied on approve, `ADMIN` allowed)
   - HCM realtime/batch/sync-result integration flows

### 18.2 Execution Commands

```bash
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

### 18.3 Proof of Execution (Snapshot)

Snapshot captured on April 24, 2026:

1. `npm run test`
   - `17` suites passed
   - `47` tests passed
2. `npm run test:e2e`
   - `2` suites passed
   - `6` tests passed
3. `npm run test:cov`
   - Statements: `94.78%`
   - Branches: `77.83%`
   - Functions: `81.81%`
   - Lines: `94.06%`

### 18.4 Regression Guardrails

1. CI/pipeline should fail on any test failure (`test` or `test:e2e`).
2. Coverage reports should be preserved as artifacts (`coverage/`) for reviewer verification.
3. Critical services (`balances`, `time-off-requests`, `hcm-integration`, `auth`) are maintained with high-coverage behavior tests.

## 19. Future Enhancements

1. Refresh tokens and token revocation.
2. Outbox/queue for guaranteed HCM delivery and retries.
3. Calendar-aware request calculation (working days, holidays, timezone).
4. OpenAPI documentation and SDK generation.

## 20. Acceptance Criteria Mapping

The implemented system satisfies the case expectations by providing:

1. A documented technical design with explicit trade-offs.
2. REST API for balances, requests, and HCM sync.
3. Defensive consistency logic for reserve/consume/release transitions.
4. Role-secured approval operation.
5. Reproducible local setup with seed users for immediate evaluation.
