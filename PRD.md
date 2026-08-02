# DevHub
### LinkedIn for Developers

Version: 1.0

Status: Phase 1 in progress

---

# Overview

DevHub is a modern developer-focused social networking platform where software developers can connect, showcase their work, collaborate, and build their professional presence.

Unlike LinkedIn, DevHub is built specifically around developers.

Users can:

- Build professional developer profiles
- Connect GitHub accounts
- Share technical posts
- Upload resumes
- Follow other developers
- Chat in real-time
- Receive notifications
- Discover developers through search
- Build their network

The goal is to create a production-grade application that demonstrates modern full-stack engineering skills.

---

# Objectives

- Learn production-level full-stack development
- Build an internship-worthy portfolio project
- Understand scalable backend architecture
- Learn authentication and authorization
- Learn real-time communication
- Learn third-party API integrations
- Learn deployment and DevOps basics

---

# Target Users

- Students
- Software Engineers
- Open Source Contributors
- Recruiters
- Hiring Managers

---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit
- React Hook Form
- Zod
- Axios
- Socket.io Client

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

---

## Authentication

- JWT
- HTTP Only Cookies
- bcrypt

---

## Storage

- Cloudinary

---

## Realtime

- Socket.io

---

## Validation

- Zod

---

## Deployment

Frontend

- Vercel

Backend

- Render / Railway

Database

- MongoDB Atlas

Images

- Cloudinary

---

# User Roles

## User

Regular developer account.

Can

- Create profile
- Create posts
- Like posts
- Comment
- Follow users
- Upload resume
- Send messages

---

## Admin

Can

- Delete posts
- Ban users
- Review reports
- View analytics

---

# Functional Requirements

---

## Authentication

Implementation status (2026-08-01): backend registration, login, logout, and
current-user authentication are implemented. The frontend has cookie-backed
Redux session state and login/signup screens. Email verification, refresh
tokens, and password recovery remain pending.

### Signup

User enters

- Name
- Email
- Password

System

- Validate input
- Hash password
- Store user
- Login automatically

---

### Login

User

Email

Password

System

- Verify credentials
- Generate JWT
- Store token in HTTP-only cookie

---

### Logout

Clear cookie

---

### Forgot Password

- Email verification
- Reset link
- Password update

---

# User Profile

Implementation status (2026-08-01): public profile pages, profile editing,
bounded career/project data, avatar/cover media, GitHub showcase caching, and
PDF resume uploads are implemented.

Each profile contains

- Profile photo
- Cover image
- Name
- Username
- Bio
- Location
- Skills
- Experience
- Education
- Portfolio
- Social Links
- Resume
- GitHub Username

---

# GitHub Integration

Implementation status (2026-08-01): users can explicitly sync a public GitHub
username. A bounded cached profile snapshot exposes repositories, stars, top
languages, and follower statistics without calling GitHub on profile reads.

User connects GitHub username.

System fetches

- Public repositories
- Followers
- Following
- Stars
- Languages
- Contributions (optional)

Automatically display on profile.

---

# Resume Upload

Implementation status (2026-08-01): authenticated users can upload a
Cloudinary-hosted PDF resume up to 5 MB. Public profiles display a secure view
or download link when a resume is available.

Accepted

- PDF

Store

Cloudinary URL

Display

Download button

---

# Posts

Implementation status (2026-08-01): authenticated users can create text or
image posts and delete their own posts. Post editing, Markdown support, and
code snippets remain pending.

Users can

- Create text posts
- Add images
- Edit post
- Delete post

Future

- Markdown support
- Code snippets

---

# Feed

Implementation status (2026-08-01): the home page provides a public,
newest-first cursor-paginated feed. Following-only feeds, suggested users, and
ranking are pending.

Home page displays

Posts from

- Following
- Suggested users

Sorted

Newest first

Future

Ranking algorithm

---

# Likes

Implementation status (2026-08-01): authenticated users can like and unlike
posts; a unique Like record enforces one like per user and post.

User

Like

Unlike

One like per user.

---

# Comments

Implementation status (2026-08-01): authenticated users can add comments and
all visitors can read cursor-paginated comment lists. Comment deletion and
nested replies remain pending.

Users can

- Add comment
- Delete own comment

Future

Nested replies

---

# Follow System

Implementation status (2026-08-01): authenticated users can follow and
unfollow developers, with duplicate and self-follow prevention. Public profile
pages display relationship counts, an optimistic Follow button, and follower /
following lists.

Users can

Follow

Unfollow

Profile shows

Followers

Following

---

# Messaging

Implementation status (2026-08-02): authenticated users can view active
one-to-one conversations and cursor-paginated history at `/messages`. Socket.io
delivers messages, typing updates, presence changes, and read receipts in real
time; REST endpoints provide the initial data and error fallback. Image and
voice messages remain pending.

Private chat

Features

- Real-time messages
- Typing indicator
- Read receipts
- Online status

Future

- Image sharing
- Voice messages

---

# Notifications

Implementation status (2026-08-02): likes, comments, follows, and direct
messages create durable recipient notifications. The header bell displays a
live unread badge and dropdown, with Socket.io delivery for connected users.

User receives notification when

- Someone follows
- Someone likes post
- Someone comments
- Someone sends message

---

# Search

Implementation status (2026-08-01): global search supports typed people,
posts, and skills results through bounded text-index queries, a debounced
navigation search bar, and a dedicated results page.

Search

Users

Posts

Skills

---

# Admin Panel

Dashboard

- Total Users
- Total Posts
- Active Users
- Reports

Admin Actions

- Delete post
- Suspend user
- Ban user

---

# Non Functional Requirements

Performance

- Fast page load
- Lazy loading
- Pagination

Security

- JWT
- Password hashing
- Input validation
- Rate limiting
- XSS protection
- CSRF protection
- Helmet

Scalability

- Modular architecture
- Clean folder structure
- Reusable services

Maintainability

- TypeScript
- ESLint
- Prettier

---

# Future Features

- AI Post Generator
- AI Resume Review
- GitHub Contribution Heatmap
- LeetCode Stats
- Bookmarks
- Dark Mode
- Two Factor Authentication
- Email Verification
- OAuth Login
- Infinite Scroll
- Trending Developers
- Trending Technologies
- Hashtags
- Saved Posts
- Recruiter Accounts
- Job Board
- Portfolio Generator

---

# Success Metrics

- Authentication works securely
- Real-time messaging works
- GitHub sync works
- Resume upload works
- Feed loads under 2 seconds
- Lighthouse score above 90
- Fully responsive
- Production deployed

---

# Folder Structure (High Level)

Frontend

app/

components/

hooks/

lib/

store/

services/

types/

styles/

Backend

src/

controllers/

services/

middlewares/

routes/

models/

validators/

utils/

config/

sockets/

jobs/

---

# Milestones

Phase 1

Authentication
Profile
Posts
Likes
Comments

Phase 2

GitHub Integration
Resume Upload
Follow System
Search

Phase 3

Messaging
Notifications
Admin Dashboard

Phase 4

Deployment
Docker
Redis
Caching
Optimization

Phase 5

AI Features
Analytics
Production Improvements

---

# End Goal

A production-ready social platform built specifically for developers that demonstrates modern full-stack engineering practices and serves as a flagship portfolio project for software engineering internships.
