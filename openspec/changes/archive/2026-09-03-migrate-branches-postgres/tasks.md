## 1. PostgreSQL schema + migration

- [x] 1.1 Create `src/migrations-pg/002_create_branches.js` defining the `branches` table: `id` VARCHAR(24) PK, `tenant_id` VARCHAR(24) REFERENCES tenant(id), `name`, `type`, `address`, `city`, `phone`, `active` BOOLEAN default true, `payment_methods` JSONB default the four methods, `next_order_number` INT default 0, `created_at`/`updated_at`; add indexes on `tenant_id` and `active` — verify the migration applies on a clean volume and `\dt` shows `branches`
- [x] 1.2 Register migration 002 and verify the runner applies it in order and doesn't re-apply on restart — verify a restart logs migration 002 applied once and "No pending migrations" after

## 2. Rewrite branch repository to PostgreSQL

- [x] 2.1 Rewrite `src/repositories/branchRepository.js` against Postgres keeping the exported names and shapes (`createBranch`, `updateBranch`, `listBranches`, `findBranchById`, `nextOrderNumber`, `toBranchObjectId`, `PAYMENT_METHODS`), returning rows with `_id` (hex) and `tenantId` — verify a temporary script can create and list a branch
- [x] 2.2 Implement `nextOrderNumber(branchId)` as atomic `UPDATE branches SET next_order_number = next_order_number + 1 RETURNING next_order_number` — verify two sequential calls return increasing values with no duplicates
- [x] 2.3 Update `listBranches` to support filtering by `tenantId`, `active`, and `q` (ILIKE on `name`) sorted by `name` — verify filters mirror the Mongo behavior in the existing tests

## 3. Multi-role branch service

- [x] 3.1 Update `src/services/branchService.js` to evaluate the role set instead of singular `role`, keeping `effectiveActive` for cashier (only active branches visible to cashier) — verify a user holding `[admin, cashier]` behaves as manager and a pure `cashier` only lists active branches

## 4. Re-point branchCount and downstream consumers

- [x] 4.1 Update `src/repositories/tenantRepository.js` so `branchCount` (`countBranches`) reads from Postgres `branches` via `GROUP BY tenant_id` instead of Mongo — verify `listTenants` returns correct `branchCount` for branches created via API
- [x] 4.2 Re-point all consumers of `branchRepository` (`userService`, `branchService`, `orderService`, `publicService`, `dishService`, `cashSessionService`, `inventoryService`, `loyaltyService`, `fifoService`) to the Postgres-backed module and remove any direct Mongo read of the `branches` collection — verify no production module imports the Mongo `branches` collection

## 5. One-time import of branches from MongoDB

- [x] 5.1 Add a one-time idempotent import that reads `branches` from MongoDB and upserts into Postgres preserving each `_id` as the 24-hex id and its `tenant_id` mapping — verify row count matches Mongo and a second run inserts no duplicates
- [x] 5.2 Wire the branch import into a CLI (`npm run db:import-branches`) sharing the Mongo/Postgres connection helpers — verify the CLI runs clean against existing data

## 6. Validation

- [x] 6.1 Run the API with a clean Postgres volume, apply migrations 001+002, and import identity + branches — verify a full `docker compose up -d --build` boots healthy
- [x] 6.2 Add end-to-end verification: create/edit/list/get a branch via API, confirm `branchCount` updates, and confirm an order flow still obtains a monotonic `nextOrderNumber` — verify the whole branch/auth path works against Postgres-backed storage
