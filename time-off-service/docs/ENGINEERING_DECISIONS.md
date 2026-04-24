# Engineering Decisions

## 1) Why reserve balance at request creation?

When a request is created, days are moved to `reservedBalance`.
This prevents overbooking when multiple requests are created before manager review.

## 2) Why admin-only approval?

Approval mutates critical business totals (`available`, `used`, `reserved`).
Restricting approval to `ADMIN` reduces risk of unauthorized financial/leave impact.

## 3) Why keep request sync status separate from business status?

Business status (`PENDING`, `APPROVED`, `REJECTED`) answers product workflow.
Sync status (`NOT_SYNCED`, `SYNCED`, `FAILED`) answers technical integration health.
Keeping both avoids coupling business logic to external system availability.

## 4) Why JWT + global guards?

Global JWT guard ensures secure-by-default endpoints.
`@Public()` is explicit and minimizes accidental exposure.
Role guard adds clear RBAC enforcement where needed.

## 5) SQLite + Prisma choice

For take-home/demo purpose:

- Low setup friction
- Fast local execution
- Deterministic behavior

This can be migrated to PostgreSQL with minimal domain-layer changes.

## 6) Known limitations (intentional for case scope)

- In-memory/seeded credential model without refresh tokens
- No rate limiting / lockout strategy
- No background queue for HCM retries
- No full audit trail entity yet

## 7) Recommended next improvements

1. Add refresh tokens + token revocation.
2. Add audit logging for approval/rejection actions.
3. Introduce outbox or queue for resilient HCM synchronization.
4. Add e2e tests for auth + RBAC scenarios.
5. Add OpenAPI/Swagger for API contract visibility.
