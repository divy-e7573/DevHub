# Project structure

This document explains the folder layout and the reasoning behind it. The
guiding principles are:

- **Clean architecture / separation of concerns** — each layer has one job and
  depends inward only.
- **Feature cohesion on the client** — code that changes together lives together.
- **No over-engineering** — only the folders a production social app actually
  needs. Empty abstractions (custom DI containers, interface-per-class, etc.)
  are deliberately omitted.
- **TypeScript everywhere** with strict mode.

```
DevHub/
├── client/          # Next.js frontend
├── server/          # Express backend
└── docs/            # Project documentation
```

---

## client/ — Next.js frontend

The client uses a **feature-based** structure. Shared, reusable code lives in
top-level folders; domain-specific code lives under `features/`. This keeps a
change to "the feed" inside the feed feature instead of scattering it across
`components/`, `hooks/`, and `store/` at the top level.

```
client/
├── public/                  # Static assets served at the site root (favicons, images, robots.txt)
│
└── src/
    ├── app/                 # Next.js App Router — ROUTES ONLY
    │   ├── layout.tsx       # Root layout: fonts, global css, store provider
    │   ├── page.tsx         # Landing page
    │   ├── globals.css
    │   ├── (auth)/          # Route group for the logged-OUT shell (login/register)
    │   │   ├── login/
    │   │   └── register/
    │   └── (main)/          # Route group for the logged-IN shell (shared nav/layout)
    │       ├── feed/
    │       ├── profile/
    │       ├── network/
    │       ├── notifications/
    │       ├── messages/
    │       └── settings/
    │
    ├── components/
    │   ├── ui/              # shadcn/ui primitives (Button, Card, Dialog, …). App-agnostic.
    │   └── common/          # App-specific shared components (Navbar, Avatar, Footer…)
    │
    ├── features/            # DOMAIN modules — the heart of the app
    │   ├── feed/
    │   ├── posts/
    │   ├── profile/
    │   ├── network/
    │   └── notifications/
    │
    ├── hooks/               # Reusable, cross-feature React hooks (useDebounce, useMediaQuery…)
    ├── services/            # HTTP layer: the Axios client + thin per-endpoint callers
    │   └── api.ts           #   single configured Axios instance
    ├── store/               # Redux Toolkit
    │   ├── index.ts         #   store assembly (feature slices register here)
    │   └── StoreProvider.tsx
    ├── schemas/             # Shared Zod schemas for form validation (React Hook Form resolvers)
    ├── types/               # Shared TS types/DTOs mirroring API responses
    ├── config/              # Client-side config/constants (env exposure, feature flags)
    └── lib/                 # Generic utilities (cn(), formatters) — no domain logic
```

### Why the client is shaped this way

**`app/` holds routes only.** In the App Router, every folder under `app/` is a
URL segment. We keep it thin — a `page.tsx` imports a feature component and
renders it. Logic does not live here. This makes routing obvious and keeps the
folder from turning into a second components directory.

**Route groups — `(auth)` and `(main)`.** Parentheses make a _group_, not a URL
segment. This lets the logged-out pages and the logged-in pages have **two
different layouts** (a centered auth card vs. a full app shell with nav)
without affecting the URL. It is the idiomatic App Router way to model
"two shells."

**`features/` is where domain work happens.** Each feature owns its own
components, hooks, slice, and API callers, colocated. For example `posts/`
would contain `PostCard.tsx`, `usePosts.ts`, `postsSlice.ts`, and
`postsApi.ts`. Deleting or renaming a feature touches one folder.

**`components/ui` vs `components/common`.** `ui/` is the design-system layer
installed by shadcn/ui — generic and copy-paste-owned. `common/` is for shared
_app_ components that aren't primitives (Navbar, UserAvatar). Separating them
stops the design system from being polluted by app-specific markup.

**`services/` isolates the network.** All HTTP goes through one Axios instance
in `services/api.ts`. When auth is added, the token interceptor is added in
exactly one place. Features call typed service functions, never Axios directly.

**`schemas/` and `types/`.** Zod schemas validate forms (via React Hook Form
resolvers) and, where useful, API payloads. `types/` holds plain TS interfaces
that mirror API responses. Keeping them separate means validation logic and
type declarations each have one home.

**`store/` is the only global client state.** Server data is fetched through
services and cached in Redux slices per feature. The store assembles those
slices; `StoreProvider` is a client component because App Router layouts render
on the server.

---

## server/ — Express backend

The server uses a **layered** structure that follows the request lifecycle
top-to-bottom. Each layer has a single responsibility and only calls the layer
beneath it.

```
server/
├── src/
│   ├── server.ts        # Entry: load config, connect DB, listen, graceful shutdown
│   ├── app.ts           # Express app: middleware wiring + route mounting (no logic)
│   │
│   ├── config/          # Environment & infrastructure setup (env, db connection)
│   ├── routes/          # URL → controller mapping; applies route-level middleware
│   ├── middleware/      # Cross-cutting request concerns (auth, errors, validation, logging)
│   ├── validators/      # Zod schemas that validate incoming request bodies/params
│   ├── controllers/     # HTTP layer: parse request, call a service, shape the response
│   ├── services/        # Business logic: orchestration, rules, transactions
│   ├── repositories/    # Data access: the ONLY layer that talks to Mongoose models
│   ├── models/          # Mongoose schemas & models (the persistence shape)
│   ├── types/           # Shared backend TS types, DTOs, Express augmentation
│   ├── constants/       # Enums and app-wide constant values
│   └── utils/           # Pure helpers (logger, pagination, formatting)
│
└── tests/
    ├── unit/            # Fast, isolated tests (services, utils) — no DB
    └── integration/     # API-level tests against routes — real app + test DB
```

### Why the server is layered this way

The request flows in one direction:

```
routes → middleware → validators → controllers → services → repositories → models
```

- **`server.ts` vs `app.ts`.** Splitting the entry from the app lets us import
  `app` in tests and spin it up with `supertest` **without opening a port**,
  and keeps bootstrap concerns (DB connect, listen, shutdown) out of the
  request-handling code.

- **`config/`** centralises environment access and the DB connection so
  `process.env` and connection tuning live in one typed, validated place.

- **`routes/`** only maps URLs to controllers and attaches route-level
  middleware. No logic — a reader can scan this folder to learn the whole API
  surface.

- **`middleware/`** holds cross-cutting concerns that apply to many routes.
  `requestLogger.ts` uses Pino HTTP to log every completed request with a
  correlation ID and status-aware severity. `errorHandler.ts` gives one
  consistent error shape and logs failures through the request-scoped logger;
  `notFound.ts` handles unmatched routes. Auth and validation middleware slot
  in here later.

- **`validators/`** (Zod) validates _input at the boundary_, before a request
  ever reaches business logic. This pairs naturally with the client's Zod
  schemas and keeps controllers free of defensive checks.

- **`controllers/`** are intentionally thin: read the request, call one
  service, return the response. They translate HTTP, nothing more.

- **`services/`** contain the actual business rules. They are the most
  important layer and the most heavily unit-tested, because they do not depend
  on Express or Mongoose directly.

- **`repositories/`** are the **only** layer that touches Mongoose. This
  isolates persistence: if a query changes or the data layer evolves, the
  blast radius is confined to this folder. It also makes services trivially
  testable with a stubbed repository.

- **`models/`** defines Mongoose schemas — the shape of persisted data, indexes,
  and validation enforced at the database layer.

- **`constants/`, `types/`, `utils/`** keep magic values, shared types, and pure
  helpers out of the business layers. `utils/logger.ts` owns Pino setup,
  redaction, child-loggers, and the development/production formatting policy.

### What was deliberately left out

To avoid over-engineering at this stage, there is **no** custom dependency
injection framework, no interface-per-class ceremony, no event bus, and no
ORM-style abstraction beyond the repository layer. Those can be introduced
later if a real need emerges; the layered design already gives us the seams
we'd need.

---

## docs/

```
docs/
├── architecture/      # This file + ADRs (Architecture Decision Records)
├── api/               # API contracts / OpenAPI specs
├── database/          # Schema design, ERDs, indexing notes
└── guides/            # Onboarding, local setup, contributing
```

Documentation lives with the code so it versioned alongside the system it
describes. ADRs capture _why_ decisions were made; `api/` and `database/`
capture the contracts the two sides of the app agree on.
