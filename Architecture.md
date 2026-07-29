# DevHub Architecture

Version: 1.0

---

# Overview

DevHub follows a modern client-server architecture designed around scalability, maintainability, and separation of concerns.

The application consists of:

- Next.js Frontend
- Express.js Backend
- MongoDB Database
- Cloudinary for Media Storage
- Socket.io for Realtime Communication
- GitHub API Integration
- Redis (Future)
- Dockerized Deployment (Future)

---

# High Level Architecture

                                    +---------------------+
                                    |      Browser       |
                                    +----------+----------+
                                               |
                                               |
                                    HTTPS / WSS
                                               |
                                               |
+--------------------------------------------------------------------+
|                          Next.js Frontend                          |
|--------------------------------------------------------------------|
| App Router                                                         |
| Server Components                                                  |
| Client Components                                                  |
| Redux Toolkit                                                      |
| Tailwind CSS                                                       |
| shadcn/ui                                                          |
+--------------------------------------------------------------------+
                       |
                       |
             REST API / WebSocket
                       |
                       |
+--------------------------------------------------------------------+
|                       Express Backend                              |
|--------------------------------------------------------------------|
| Authentication                                                     |
| User Service                                                       |
| Post Service                                                       |
| Comment Service                                                    |
| Follow Service                                                     |
| Notification Service                                               |
| Chat Service                                                       |
| Search Service                                                     |
| GitHub Integration Service                                         |
+--------------------------------------------------------------------+
           |            |             |               |
           |            |             |               |
           |            |             |               |
      MongoDB      Cloudinary     Socket.io      GitHub API

---

# Why This Architecture?

The frontend is responsible only for:

- UI
- User interactions
- Form validation
- Rendering pages
- Calling APIs

The backend is responsible for:

- Business logic
- Authentication
- Authorization
- Database operations
- File handling
- Integrations
- Security

This separation makes the application easier to maintain and scale.

---

# System Components

## 1. Frontend

Framework

- Next.js (App Router)

Responsibilities

- Rendering pages
- Route handling
- Forms
- API communication
- State management
- Authentication state
- Responsive UI

Technologies

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit
- Axios
- React Hook Form
- Zod

---

## 2. Backend

Framework

- Express.js

Responsibilities

- REST APIs
- JWT Authentication
- Business Logic
- Database operations
- Validation
- Security
- Realtime Events
- Third-party integrations

---

## 3. Database

Database

MongoDB Atlas

ODM

Mongoose

Responsibilities

- User data
- Posts
- Comments
- Likes
- Followers
- Notifications
- Chats

---

## 4. Cloudinary

Used for

- Profile images
- Cover images
- Post images
- Resume PDFs

Database stores only URLs.

---

## 5. Socket.io

Realtime communication

Features

- Chat
- Typing Indicator
- Online Status
- Read Receipts
- Live Notifications

---

## 6. GitHub API

Used to fetch

- Repositories
- Followers
- Following
- Languages
- Stars
- Profile Information

---

# Request Flow

Example

User creates a post

Browser

↓

Next.js

↓

POST /api/posts

↓

Express Route

↓

Controller

↓

Service

↓

Database

↓

Response

↓

Frontend Updates UI

---

# Authentication Flow

User Login

↓

Validate Credentials

↓

Compare Password

↓

Generate JWT

↓

Store JWT inside HTTP-only Cookie

↓

Return User Information

↓

Frontend updates authentication state

---

# Authorization Flow

Protected Request

↓

JWT Middleware

↓

Verify Token

↓

Find User

↓

Attach User to Request

↓

Continue

↓

Controller

---

# Folder Communication

Frontend

Pages

↓

Components

↓

Hooks

↓

API Layer

↓

Backend

Backend

Routes

↓

Controllers

↓

Services

↓

Models

↓

MongoDB

Each layer has only one responsibility.

---

# Backend Layer Responsibilities

## Routes

Responsible for

- Defining endpoints
- Applying middleware

Should NOT contain

- Business logic

---

## Controllers

Responsible for

- Receiving request
- Returning response

Should NOT contain

- Database queries
- Complex logic

---

## Services

Responsible for

- Business logic
- Validation
- Database interaction

This is where most logic lives.

---

## Models

Responsible for

- MongoDB schemas
- Data relationships

---

## Middleware

Responsible for

- Authentication
- Authorization
- Validation
- Error Handling
- Rate Limiting

---

## Utils

Contains

- JWT helper
- Password helper
- Cloudinary helper
- Response formatter

---

# Frontend Layer Responsibilities

Pages

↓

Compose screen

Components

↓

Reusable UI

Hooks

↓

Reusable logic

Services

↓

API calls

Store

↓

Global State

Types

↓

TypeScript interfaces

---

# State Management

Global State

- Logged in user
- Notifications
- Theme
- Chat state

Local State

- Form inputs
- Modal state
- Search input

---

# Data Flow

User Action

↓

UI Event

↓

API Call

↓

Express Route

↓

Controller

↓

Service

↓

MongoDB

↓

Controller

↓

JSON Response

↓

Frontend

↓

UI Update

---

# Security Architecture

Authentication

JWT

Authorization

Role Based Access Control

Passwords

bcrypt

Cookies

HTTP-only

Validation

Zod

Security Headers

Helmet

Rate Limiting

Express Rate Limit

CORS

Restricted Origins

---

# Error Handling

Every request follows

Request

↓

Validation

↓

Business Logic

↓

Database

↓

Success

OR

↓

Central Error Handler

↓

JSON Error Response

Example

{
    "success": false,
    "message": "Post not found"
}

---

# Logging

Future

Application Logs

↓

Logger

↓

Console (Development)

↓

File / Monitoring (Production)

Possible tools

- Pino
- Winston

---

# Scalability Plan

Current

Single Express Server

Future

Load Balancer

↓

Multiple Backend Instances

↓

Redis

↓

MongoDB Atlas

↓

Cloudinary

This allows horizontal scaling.

---

# Caching Strategy (Future)

Redis will cache

- User Profiles
- Search Results
- Trending Posts
- Notifications

This reduces database load.

---

# Deployment Architecture

                Users
                  |
            HTTPS Requests
                  |
            Vercel (Frontend)
                  |
              Express API
        (Render / Railway / VPS)
                  |
      ----------------------------
      |            |             |
 MongoDB      Cloudinary      GitHub API

---

# Design Principles

The project follows

- Separation of Concerns
- Single Responsibility Principle
- Modular Design
- Feature-based Development
- Reusable Components
- Scalable Folder Structure
- RESTful API Design

---

# Future Architecture Improvements

- Redis
- Background Jobs
- Message Queue
- Microservices
- GraphQL
- ElasticSearch
- Kubernetes
- CDN
- Monitoring
- CI/CD Pipeline

---

# Final Architecture Goals

The architecture should be

- Modular
- Easy to maintain
- Easy to extend
- Production ready
- Secure
- Scalable
- Interview worthy