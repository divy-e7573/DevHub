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
status endpoint. Registration, login, logout, and the protected current-user
endpoint are available under `/api/v1/auth`; login issues a JWT only in a
secure HTTP-only cookie. The client includes Redux-backed session restoration
and `/login` and `/signup` screens. Public developer profiles are available at
`/[username]`, with typed profile updates, avatar/cover uploads through
Cloudinary, and a Redux-synchronised edit experience. Refresh tokens and email
verification are not implemented yet. The home screen now provides a
cursor-paginated social feed with post images, likes, and comments. The
platform also supports developer follows and typed global search across people,
posts, and skills, real-time one-to-one messaging, and live social
notifications. The structure follows clean-architecture principles and is
meant to scale. Profiles can also cache a GitHub showcase and publish a
Cloudinary-hosted PDF resume.

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
