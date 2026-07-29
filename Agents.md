# AGENTS.md

# DevHub AI Development Guide

Version: 1.0

---

# Project Overview

DevHub is a production-grade social networking platform built specifically for developers.

The application should resemble a simplified LinkedIn designed for software engineers while following modern software engineering best practices.

This project is intended for learning, portfolio building, and internship interviews.

The goal is NOT to build features as quickly as possible.

The goal is to build software the way professional engineering teams do.

---

# Primary Objective

Always prioritize

- Code quality
- Readability
- Scalability
- Maintainability
- Security

over

- Writing less code
- Quick hacks
- Temporary fixes

---

# Tech Stack

Frontend

- Next.js (Latest Stable)
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit
- Axios
- React Hook Form
- Zod

Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.io
- Multer
- Cloudinary

Deployment

- Vercel
- Render/Railway
- MongoDB Atlas

Future

- Redis
- Docker
- GitHub Actions

Do NOT replace technologies unless explicitly instructed.

---

# Coding Philosophy

Always write code as if the project will be maintained by multiple developers.

Avoid shortcuts.

Avoid unnecessary complexity.

Prefer clean architecture.

Prefer reusable code.

---

# Architecture Rules

Follow

Routes

↓

Controllers

↓

Services

↓

Models

Business logic belongs inside Services.

Controllers should remain thin.

Routes should never contain business logic.

Models should only define schemas.

---

# Frontend Rules

Use

- Server Components whenever possible.
- Client Components only when necessary.
- Keep components small.
- Prefer composition over large components.
- Avoid prop drilling.
- Reuse UI components.

Never create unnecessary global state.

---

# Backend Rules

Controllers

Responsible only for

- Receiving request
- Calling service
- Returning response

Services

Responsible for

- Business logic
- Validation
- Database interaction

Never write business logic inside controllers.

---

# Folder Structure

Frontend

app/

components/

features/

hooks/

lib/

services/

store/

types/

Backend

src/

controllers/

routes/

services/

middlewares/

models/

validators/

utils/

config/

sockets/

---

# TypeScript Rules

Never use

any

unless absolutely unavoidable.

Prefer

interfaces

for object contracts.

Use

types

for unions and utility types.

Enable strict mode.

---

# API Rules

Use RESTful conventions.

Examples

GET /users

GET /users/:id

POST /posts

PATCH /posts/:id

DELETE /posts/:id

Return consistent JSON responses.

Example

{
    "success": true,
    "message": "Post created",
    "data": {}
}

Errors

{
    "success": false,
    "message": "Unauthorized"
}

---

# Database Rules

Normalize data where appropriate.

Reference documents using ObjectId.

Avoid unnecessary duplication.

Create indexes where needed.

Use timestamps.

Never store passwords in plain text.

---

# Authentication Rules

Use JWT.

Store JWT inside HTTP-only cookies.

Never store JWT inside localStorage.

Passwords must always be hashed.

Protect every private route.

---

# Validation Rules

Validate

- Request body
- Params
- Query

Use Zod.

Never trust client input.

---

# Error Handling

Never expose internal server errors.

Always return meaningful messages.

Use centralized error handling middleware.

---

# Security Rules

Always consider

Authentication

Authorization

Rate Limiting

Input Validation

CORS

Helmet

Cookie Security

XSS Prevention

NoSQL Injection Prevention

---

# Performance Rules

Avoid unnecessary database queries.

Use pagination.

Select only required fields.

Populate only when necessary.

Lazy load frontend components where appropriate.

---

# UI Guidelines

Design should be

- Modern
- Minimal
- Responsive
- Accessible

Avoid excessive animations.

Maintain consistent spacing.

Use reusable UI components.

---

# Naming Conventions

Components

PascalCase

Example

UserCard.tsx

Hooks

useSomething.ts

Example

useAuth.ts

Routes

kebab-case

Variables

camelCase

Interfaces

Prefix with I only if project consistently follows that convention.

---

# Git Rules

Use feature branches.

Example

feature/auth

feature/posts

feature/chat

Commit format

feat(auth): add JWT authentication

fix(posts): resolve image upload bug

refactor(profile): simplify validation

docs(api): update endpoints

---

# Documentation Rules

Whenever a major feature is completed

Update

README

PRD

API Documentation (if changed)

Do not let documentation become outdated.

---

# AI Instructions

If requirements are unclear

Ask for clarification.

Do NOT invent requirements.

Do NOT create random features.

Do NOT introduce libraries without reason.

Do NOT change project architecture without approval.

Do NOT rename folders unless requested.

Do NOT delete existing functionality unless requested.

When multiple implementations exist

Explain the tradeoffs.

Recommend the most production-ready approach.

---

# Code Quality Checklist

Before generating code ensure

- Readable
- Modular
- Typed
- Reusable
- Error handled
- Validated
- Secure
- Responsive
- Production-ready

---

# Project Scope

Core Features

- Authentication
- Profile
- GitHub Integration
- Resume Upload
- Posts
- Likes
- Comments
- Follow System
- Messaging
- Notifications
- Search
- Admin Dashboard

Future Features

- AI Resume Review
- AI Post Generator
- Redis
- Docker
- Analytics
- Monitoring
- CI/CD

Do not implement future features unless requested.

---

# Final Principle

Build software that could realistically be used by thousands of developers.

Every decision should prioritize maintainability, scalability, security, and clean engineering practices over writing the least amount of code.