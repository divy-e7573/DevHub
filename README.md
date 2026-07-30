# DevHub

A LinkedIn-style social platform for developers. DevHub helps engineers
showcase their work, share knowledge, grow their professional network, and
find opportunities.

## Repository layout

This is a **monorepo** containing three top-level areas:

| Directory | What it contains                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `client/` | Next.js (App Router) frontend — TypeScript, Tailwind, shadcn/ui, Redux Toolkit, React Hook Form + Zod |
| `server/` | Node.js + Express backend — TypeScript, MongoDB, Mongoose                                             |
| `docs/`   | Project documentation (architecture, API contracts, database schema, guides)                          |

## Status

The initial project foundation is in place. The backend has validated
configuration, security headers, CORS, Pino structured request and error
logging, rate limiting, compression, centralized error handling, and a root
status endpoint. No authentication or business routes are implemented yet. The
structure follows clean-architecture principles and is meant to scale.

## Prerequisites

- Node.js >= 20
- npm >= 10 (or pnpm/yarn)
- MongoDB >= 6 (local instance or Atlas)

## Getting started

```bash
# Frontend
cd client
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000

# Backend (in a second terminal)
cd server
cp .env.example .env
npm install
npm run dev          # http://localhost:5000
```

## Documentation

- [Architecture](docs/architecture/README.md)
- [API](docs/api/README.md)
- [Database](DATABASE.md)
- [Database design details](docs/database/README.md)
- [Guides](docs/guides/README.md)

## Conventions

- Code is written in TypeScript everywhere.
- The client uses a **feature-based** structure; the server uses a
  **layered** structure (routes → controllers → services → repositories → models).
- See `docs/` for the rationale behind each layer.
