## 1. Dependencies and Setup

- [x] 1.1 Add `bcryptjs` and `zod` to `backend/package.json` and install them
- [x] 1.2 Create the layered directory structure under `backend/src`: `models`, `repositories`, `services`, `controllers`, `middleware`, `migrations`, `utils`

## 2. Migration Runner

- [x] 2.1 Create `backend/src/db/migrations.js` with `runMigrations(db)` that creates the `migrations` collection, reads applied versions, and applies pending migrations in version order
- [x] 2.2 Create `backend/src/migrations/001_create_users.js` that creates the `users` collection with a unique index on `email` and an index on `status`
- [x] 2.3 Call `runMigrations` in `backend/src/server.js` startup before `app.listen`; fail fast (log and `process.exit(1)`) on migration error
- [x] 2.4 Verify migrations apply once on a clean database and are not re-applied on subsequent startups

## 3. User Model and Repository

- [x] 3.1 Create `backend/src/models/user.js` with the user document shape, constants for `status` values, and `toPublicUser()` that strips `passwordHash`
- [x] 3.2 Create `backend/src/repositories/userRepository.js` with `create`, `findById`, `findByEmail`, `update`, `delete`, and paginated `list` (with `status` filter) using the existing Mongo client from `db/mongo.js`
- [x] 3.3 Map MongoDB duplicate key error (code 11000) to a domain conflict error in the repository

## 4. Validation Schemas

- [x] 4.1 Create `backend/src/validation/userSchemas.js` with `createUserSchema`, `updateUserSchema`, and list query schema (`page`, `limit`, `status`) using zod
- [x] 4.2 Create a validation middleware that parses the request body/query and returns HTTP 400 with descriptive errors on failure

## 5. Service Layer

- [x] 5.1 Create `backend/src/services/userService.js` with `createUser` (hashing password with bcryptjs), `getUser`, `updateUser` (re-hash when password changes), `deleteUser`, and `listUsers` (pagination + status filter)
- [x] 5.2 Ensure service responses always pass users through `toPublicUser` so `passwordHash` is never returned
- [x] 5.3 Throw domain errors (not found, conflict) from the service for controller mapping

## 6. Controllers and Routes

- [x] 6.1 Create `backend/src/controllers/userController.js` mapping domain errors to HTTP status codes (400, 404, 409) and success responses (201, 200, 204)
- [x] 6.2 Create `backend/src/routes/users.js` with `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, and `GET /` (pagination) mounted at `/api/users` in `backend/src/server.js`
- [x] 6.3 Verify the API: create/read/update/delete/list users, 404s, 409 duplicate email, 400 invalid payloads, and no `passwordHash` in any response

## 7. Documentation and Validation

- [x] 7.1 Update `.env.example` if any new environment variables are required (expected: none)
- [x] 7.2 Run `openspec validate --change add-user-crud-mongo` and confirm the change validates
