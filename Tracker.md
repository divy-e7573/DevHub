# DevHub Development Tracker

Last reviewed: 2026-08-01

This tracker reflects the implementation currently present in the repository.
An item is marked complete only when the code or documentation exists and is
usable; an empty folder or installed dependency does not count as a feature
implementation.

## Current milestone: project foundation

### Completed

| Area                     | Completed work                                                                                                                                                                                                                                                                 | Evidence                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Repository               | npm-workspaces monorepo with `client/`, `server/`, and `docs/` packages                                                                                                                                                                                                        | Root `package.json`, workspace lockfile                                                                                       |
| Documentation            | Product requirements, engineering rules, architecture rationale, and documentation sections established                                                                                                                                                                        | `PRD.md`, `Agents.md`, `Architecture.md`, `docs/`                                                                             |
| Environment templates    | Grouped, documented client and server environment-variable templates with placeholders only                                                                                                                                                                                    | `client/.env.example`, `server/.env.example`                                                                                  |
| Client foundation        | Next.js App Router + TypeScript strict mode; root layout; global Tailwind CSS v4/PostCSS setup; initial landing page                                                                                                                                                           | `client/src/app/`, `client/tsconfig.json`, `client/postcss.config.mjs`                                                        |
| Client structure         | Auth and main route groups plus feature, component, hook, schema, service, store, config, lib, and type directories                                                                                                                                                            | `client/src/`                                                                                                                 |
| Client infrastructure    | Axios API instance, Redux Toolkit store factory, browser store provider, and `cn` utility                                                                                                                                                                                      | `client/src/services/api.ts`, `client/src/store/`, `client/src/lib/utils.ts`                                                  |
| Server foundation        | Express application separated from the process entry point; TypeScript strict mode enabled                                                                                                                                                                                     | `server/src/app.ts`, `server/src/server.ts`, `server/tsconfig.json`                                                           |
| Server infrastructure    | Centralized, immutable runtime configuration with typed environment validation, fail-fast startup checks, and production-specific HTTPS/proxy safeguards; Pino structured request/error logging with request IDs and redaction; 404/error handling, and graceful HTTP shutdown | `server/src/config/`, `server/src/middleware/`, `server/src/utils/logger.ts`                                                  |
| Backend HTTP foundation  | Express bootstrap with Helmet, CORS, Pino request logging, rate limiting, native gzip response compression, request parsing, and the root API status endpoint                                                                                                                  | `server/src/app.ts`, `server/src/middleware/`, `server/src/server.ts`                                                         |
| API routing foundation   | Versioned API router composition for `/api/v1/auth`, `/api/v1/users`, and `/api/v1/posts`; feature router modules contain no endpoint handlers until their features are implemented                                                                                            | `server/src/routes/`, `server/src/app.ts`                                                                                     |
| API response utilities   | Typed, reusable helpers for success, created, bad-request, unauthorized, forbidden, not-found, and masked internal-server-error responses; existing HTTP response writers use the shared response utility                                                                      | `server/src/utils/response.ts`, `server/src/types/responses.ts`, `server/src/app.ts`, `server/src/middleware/errorHandler.ts` |
| Database model standards | Documented conventions for timestamps, naming, ObjectId references, query-led indexes, future soft deletion, and cursor pagination; shared schema-agnostic TypeScript contracts added without creating a business model                                                        | `docs/database/model-conventions.md`, `server/src/types/database.ts`                                                          |
| Database schema design   | Detailed, implementation-free design for User, Profile, Post, Comment, Follow, Notification, Conversation, and Message relationships, fields, indexes, uniqueness, timestamps, and embedding/reference choices                                                                 | `docs/database/schema-design.md`                                                                                              |
| Database ER diagram      | Mermaid diagram of the approved collections, cardinalities, and ObjectId reference directions; no Mongoose code generated                                                                                                                                                      | `docs/database/er-diagram.md`                                                                                                 |
| Database reference       | Consolidated collection, relationship, index, scalability, cursor-pagination, soft-delete, and search strategy documentation; no implementation code                                                                                                                           | `DATABASE.md`                                                                                                                 |
| Global error system      | Typed `AppError`, consistent error responses, and centralized normalization for validation, cast, duplicate-key, JWT-shaped, malformed JSON, 404, rate-limit, and unknown errors                                                                                               | `server/src/utils/AppError.ts`, `server/src/types/errors.ts`, `server/src/middleware/errorHandler.ts`                         |
| Server structure         | Layered directories for routes, controllers, services, repositories, models, validators, middleware, types, constants, and utilities                                                                                                                                           | `server/src/`                                                                                                                 |
| Test foundation          | Jest + ts-jest configured; configuration, logging, request logger, global error-handler, and response-helper unit coverage added, with an integration-test location reserved                                                                                                   | `server/jest.config.cjs`, `server/tests/`                                                                                     |
| Tooling                  | Development, build, lint, format, type-check, and test scripts defined for the workspace and packages; dependencies installed                                                                                                                                                  | Root, `client/package.json`, `server/package.json`                                                                            |
| Verification             | Client/server type checks and production builds pass; backend configuration, logging, global-error, and response-helper tests pass                                                                                                                                             | `npm run type-check`, `npm run build`, `npm test -w server` (2026-07-29)                                                      |

## Product features

- Authentication: registration and login are implemented. Login validates
  credentials, explicitly loads the password hash, compares it with bcrypt,
  signs a JWT from validated environment configuration, and stores it in an
  HTTP-only cookie. Logout clears the cookie, `GET /auth/me` is protected by
  JWT middleware, and the frontend has Redux session state plus login/signup
  forms. Refresh tokens, email verification, and forgot/reset password remain
  pending.
- User profiles and profile editing
- GitHub integration
- Resume PDF upload and Cloudinary storage
- Posts and feed
- Likes and comments
- Follow system and network views
- Search across users, posts, and skills
- Real-time messaging
- Notifications
- Admin dashboard and moderation actions

## Foundation follow-ups before feature work

These are scaffolded or represented by dependencies, but are not complete
features and should be addressed as part of implementation:

- Add route/controller/service/model/validator implementations per feature
- Add API, database schema, and automated unit/integration tests as contracts are created

## PRD milestone status

| PRD phase                                                  | Status                        |
| ---------------------------------------------------------- | ----------------------------- |
| Phase 1 — Authentication, Profile, Posts, Likes, Comments  | In progress                   |
| Phase 2 — GitHub, Resume, Follow System, Search            | Not started                   |
| Phase 3 — Messaging, Notifications, Admin Dashboard        | Not started                   |
| Phase 4 — Deployment, Docker, Redis, caching, optimization | Not started                   |
| Phase 5 — AI features, analytics, production improvements  | Not started                   |
