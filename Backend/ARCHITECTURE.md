# Blog Platform - System Architecture

## Overview

Collaborative multi-author blog platform built with MEAN stack (MongoDB, Express.js, Angular 16+, Node.js) with real-time features, role-based access control, and comprehensive API documentation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                         (Angular 16+ Frontend)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Readers    │  │   Authors    │  │   Editors    │  │    Admins    │   │
│  │   (Public)   │  │  (Authors)   │  │  (Editors)   │  │  (Admins)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │                  │            │
│         └──────────────────┴──────────────────┴──────────────────┘            │
│                                   │                                            │
│                         ┌─────────▼─────────┐                                 │
│                         │   Angular SPA     │                                 │
│                         │  - Components     │                                 │
│                         │  - Services       │                                 │
│                         │  - Guards (RBAC)  │                                 │
│                         │  - Interceptors   │                                 │
│                         └─────────┬─────────┘                                 │
└───────────────────────────────────┼───────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS + WebSocket
                                    │
┌───────────────────────────────────▼───────────────────────────────────────────┐
│                         API GATEWAY / MIDDLEWARE LAYER                         │
│                              (Express.js)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Security Middleware Stack                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │    CORS      │  │    Helmet    │  │ Rate Limiting│               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │ Mongo Sanitize│ │   XSS Clean  │  │     HPP      │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Authentication & Authorization                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │         JWT Authentication Middleware                        │    │  │
│  │  │  - Token Verification                                        │    │  │
│  │  │  - User Lookup & Injection                                   │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │         RBAC Middleware (Role-Based Access Control)          │    │  │
│  │  │  - ADMIN: Full access                                        │    │  │
│  │  │  - EDITOR: Modify any article                                │    │  │
│  │  │  - AUTHOR: Create/modify own articles                        │    │  │
│  │  │  - READER: Read and comment                                  │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼───────────────────────────────────────────┐
│                          APPLICATION LAYER                                     │
│                              (Node.js)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Route Handlers                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │   /api/auth  │  │ /api/users   │  │/api/articles │               │  │
│  │  │ - register   │  │ - CRUD       │  │ - CRUD       │               │  │
│  │  │ - login      │  │ - RBAC       │  │ - RBAC       │               │  │
│  │  │ - refresh    │  │              │  │ - Like       │               │  │
│  │  │ - logout     │  │              │  │              │               │  │
│  │  │ - profile    │  │              │  │              │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │/api/comments │  │/api/notif... │  │ /api-docs    │               │  │
│  │  │ - CRUD       │  │ - Read       │  │ - Swagger UI │               │  │
│  │  │ - Nested     │  │ - Mark read  │  │              │               │  │
│  │  │ - Like       │  │              │  │              │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Controllers                                    │  │
│  │  - auth.controller.js     - article.controller.js                     │  │
│  │  - user.controller.js     - comment.controller.js                     │  │
│  │                          - notification.controller.js                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Validators                                     │  │
│  │  - Input Validation (express-validator)                               │  │
│  │  - Sanitization                                                       │  │
│  │  - Error Handling                                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼───────────────────────────────────────────┐
│                         REAL-TIME LAYER                                        │
│                           (Socket.io)                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Socket.io Server                                   │  │
│  │  - JWT Authentication on Connection                                   │  │
│  │  - User Rooms (user:userId)                                          │  │
│  │  - Event Broadcasting                                                │  │
│  │    • comment:new      → Broadcast new comments                        │  │
│  │    • comment:update   → Broadcast comment updates                     │  │
│  │    • comment:delete   → Broadcast comment deletions                   │  │
│  │    • comment:like     → Broadcast like updates                        │  │
│  │    • notification     → Send to specific user                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼───────────────────────────────────────────┐
│                          DATA LAYER                                            │
│                          (MongoDB)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Collections                                   │  │
│  │                                                                       │  │
│  │  ┌──────────────┐                                                    │  │
│  │  │    Users     │                                                    │  │
│  │  │ - _id        │                                                    │  │
│  │  │ - username   │                                                    │  │
│  │  │ - email      │                                                    │  │
│  │  │ - password   │ (bcrypt hashed)                                    │  │
│  │  │ - role       │ (ADMIN|EDITOR|AUTHOR|READER)                       │  │
│  │  │ - avatar     │                                                    │  │
│  │  │ - bio        │                                                    │  │
│  │  └──────────────┘                                                    │  │
│  │                                                                       │  │
│  │  ┌──────────────┐                                                    │  │
│  │  │   Articles   │                                                    │  │
│  │  │ - _id        │                                                    │  │
│  │  │ - title      │                                                    │  │
│  │  │ - slug       │                                                    │  │
│  │  │ - content    │                                                    │  │
│  │  │ - author     │ (ref: User)                                        │  │
│  │  │ - status     │ (DRAFT|PUBLISHED|ARCHIVED)                         │  │
│  │  │ - tags[]     │                                                    │  │
│  │  │ - likes[]    │ (ref: User)                                        │  │
│  │  │ - views      │                                                    │  │
│  │  └──────────────┘                                                    │  │
│  │                                                                       │  │
│  │  ┌──────────────┐                                                    │  │
│  │  │   Comments   │                                                    │  │
│  │  │ - _id        │                                                    │  │
│  │  │ - content    │                                                    │  │
│  │  │ - article    │ (ref: Article)                                     │  │
│  │  │ - author     │ (ref: User)                                        │  │
│  │  │ - parentComment │ (ref: Comment, null for top-level)              │  │
│  │  │ - likes[]    │ (ref: User)                                        │  │
│  │  │ - isDeleted  │ (soft delete)                                      │  │
│  │  └──────────────┘                                                    │  │
│  │                                                                       │  │
│  │  ┌──────────────┐                                                    │  │
│  │  │Notifications │                                                    │  │
│  │  │ - _id        │                                                    │  │
│  │  │ - recipient  │ (ref: User)                                        │  │
│  │  │ - type       │ (COMMENT|REPLY|LIKE|...)                           │  │
│  │  │ - isRead     │                                                    │  │
│  │  │ - relatedArticle │ (ref: Article)                                 │  │
│  │  │ - relatedComment │ (ref: Comment)                                 │  │
│  │  └──────────────┘                                                    │  │
│  │                                                                       │  │
│  │  ┌──────────────┐                                                    │  │
│  │  │RefreshTokens │                                                    │  │
│  │  │ - token      │                                                    │  │
│  │  │ - user       │ (ref: User)                                        │  │
│  │  │ - expiresAt  │                                                    │  │
│  │  │ - revokedAt  │                                                    │  │
│  │  └──────────────┘                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Indexes for Performance                          │  │
│  │  - Users: email, username, role                                      │  │
│  │  - Articles: author, status, tags, publishedAt                       │  │
│  │  - Comments: article, author, parentComment                          │  │
│  │  - Notifications: recipient, isRead, createdAt                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW EXAMPLES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Authentication Flow:                                                         │
│  ┌─────────┐    POST /api/auth/login     ┌──────────┐                       │
│  │ Client  │ ─────────────────────────>  │  API     │                       │
│  │         │                             │ Gateway  │                       │
│  │         │ <─────────────────────────  │          │                       │
│  │         │    {accessToken,refreshToken│          │                       │
│  └─────────┘                             └────┬─────┘                       │
│                                               │                              │
│                                               │ Verify credentials            │
│                                               ▼                              │
│                                        ┌──────────────┐                      │
│                                        │   MongoDB    │                      │
│                                        │    Users     │                      │
│                                        └──────────────┘                      │
│                                                                               │
│  Article Creation Flow:                                                       │
│  ┌─────────┐    POST /api/articles      ┌──────────┐                        │
│  │ Author  │ ─────────────────────────> │  API     │                        │
│  │ (Auth)  │    JWT Token               │ Gateway  │                        │
│  │         │                             │          │                        │
│  │         │  1. Validate JWT            │          │                        │
│  │         │  2. Check RBAC (AUTHOR+)    │          │                        │
│  │         │  3. Validate Input          │          │                        │
│  │         │  4. Create Article          │          │                        │
│  │         │                             │          │                        │
│  │         │ <─────────────────────────  │          │                        │
│  │         │    {success, article}       │          │                        │
│  └─────────┘                             └────┬─────┘                        │
│                                               │                               │
│                                               │ Save                          │
│                                               ▼                               │
│                                        ┌──────────────┐                       │
│                                        │   MongoDB    │                       │
│                                        │   Articles   │                       │
│                                        └──────────────┘                       │
│                                                                               │
│  Real-time Comment Flow:                                                      │
│  ┌─────────┐    POST /api/comments      ┌──────────┐                        │
│  │ Reader  │ ─────────────────────────> │  API     │                        │
│  │ (Auth)  │    {content, articleId}    │ Gateway  │                        │
│  │         │                             │          │                        │
│  │         │  1. Create Comment          │          │                        │
│  │         │  2. Save to MongoDB         │          │                        │
│  │         │  3. Create Notification     │          │                        │
│  │         │                             │          │                        │
│  │         │ <─────────────────────────  │          │                        │
│  │         │    {success, comment}       │          │                        │
│  └─────────┘                             └────┬─────┘                        │
│                                               │                               │
│                                               │ Emit via Socket.io            │
│                                               ▼                               │
│                                        ┌──────────────┐                       │
│                                        │  Socket.io   │                       │
│                                        │   Server     │                       │
│                                        └──────┬───────┘                       │
│                                               │                               │
│                        ┌──────────────────────┼──────────────────────┐       │
│                        │                      │                      │       │
│                        ▼                      ▼                      ▼       │
│                  ┌─────────┐          ┌─────────┐          ┌─────────┐      │
│                  │ Article │          │ Author  │          │ Other   │      │
│                  │  Author │          │ Room    │          │ Clients │      │
│                  │  (Room) │          │         │          │         │      │
│                  └─────────┘          └─────────┘          └─────────┘      │
│                  Receive notification  Receive notification  See new comment │
│                                                                               │
│  Role-Based Access Control Flow:                                              │
│                                                                               │
│  Request → JWT Middleware → Extract User → RBAC Middleware                   │
│                                                      │                         │
│                                                      ▼                         │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │              Role Permission Matrix                       │                │
│  │                                                            │                │
│  │  Endpoint          │ ADMIN │ EDITOR │ AUTHOR │ READER     │                │
│  │  ─────────────────────────────────────────────────────    │                │
│  │  DELETE /articles  │  ✓   │   ✗   │   ✗   │   ✗        │                │
│  │  PUT /articles     │  ✓   │   ✓   │  ✓*  │   ✗        │                │
│  │  POST /articles    │  ✓   │   ✓   │   ✓   │   ✗        │                │
│  │  GET /articles     │  ✓   │   ✓   │   ✓   │   ✓        │                │
│  │  POST /comments    │  ✓   │   ✓   │   ✓   │   ✓        │                │
│  └──────────────────────────────────────────────────────────┘                │
│  * = Only own articles                                                        │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Frontend (Angular 16+)

- **Components**: Article list, article detail, comment sections, user profiles
- **Services**: HTTP client services for API communication, Socket.io client for real-time
- **Guards**: Route guards implementing RBAC
- **Interceptors**: JWT token injection, error handling

### 2. Backend API (Express.js)

- **Routes**: RESTful API endpoints with Swagger documentation
- **Controllers**: Business logic handlers
- **Middleware**: Authentication, authorization, validation, security
- **Validators**: Input validation using express-validator

### 3. Real-time Communication (Socket.io)

- **Authentication**: JWT-based socket authentication
- **Rooms**: User-specific rooms for targeted notifications
- **Events**: Comment updates, new comments, notifications

### 4. Database (MongoDB)

- **Collections**: Users, Articles, Comments, Notifications, RefreshTokens
- **Relationships**: Referenced documents with population
- **Indexes**: Optimized queries on frequently accessed fields

### 5. Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days)
- **Rate Limiting**: Protection against brute force and DDoS
- **Input Validation**: XSS, injection, and parameter pollution protection
- **CORS**: Configured for Angular frontend origin

## API Documentation

All API endpoints are documented with Swagger/OpenAPI 3.0. Access documentation at:

- **URL**: `http://localhost:3000/api-docs`

The documentation includes:

- All endpoints with request/response schemas
- Authentication requirements
- Role-based access information
- Example requests and responses
- Interactive testing interface

## Deployment Considerations

### Environment Variables Required:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
```

### Optional Enhancements (Future):

- **Redis**: Caching layer for frequently accessed articles
- **ElasticSearch**: Full-text search capabilities
- **Microservices**: Split into UserService, ArticleService, NotificationService
- **Web Push API**: Browser push notifications
- **Analytics Dashboard**: Angular + Chart.js for metrics

## Scalability

- Horizontal scaling: Stateless API servers behind load balancer
- Database: MongoDB replica sets for read scaling
- Real-time: Socket.io with Redis adapter for multi-server support
- Caching: Redis for session management and API response caching
