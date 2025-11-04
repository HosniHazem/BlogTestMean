# Blog Platform - Backend API

Collaborative multi-author blog platform built with MEAN stack (MongoDB, Express.js, Angular 16+, Node.js).

## Features

- ✅ **User Management**: Registration, authentication, profile management
- ✅ **Authentication**: JWT + Refresh Token system
- ✅ **Role-Based Access Control (RBAC)**: Admin, Editor, Author, Reader roles
- ✅ **Article Management**: Full CRUD operations with RBAC
- ✅ **Comments System**: Nested comments with real-time updates
- ✅ **Notifications**: Real-time notifications via Socket.io
- ✅ **Security**: bcrypt password hashing, rate limiting, CORS, input validation
- ✅ **API Documentation**: Complete Swagger/OpenAPI 3.0 documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit, express-mongo-sanitize, xss-clean, hpp
- **Documentation**: swagger-jsdoc, swagger-ui-express

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog-platform
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-key-here
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
FRONTEND_URL=http://localhost:4200
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Documentation

Once the server is running, access the Swagger API documentation at:

- **URL**: `http://localhost:3000/api-docs`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (self or Admin)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/:id/articles` - Get user's articles

### Articles

- `GET /api/articles` - Get all articles (public, with optional auth)
- `GET /api/articles/:id` - Get article by ID or slug (public, with optional auth)
- `POST /api/articles` - Create article (Author, Editor, Admin)
- `PUT /api/articles/:id` - Update article (Author own, Editor, Admin)
- `DELETE /api/articles/:id` - Delete article (Admin only)
- `POST /api/articles/:id/like` - Like/unlike article (Authenticated)

### Comments

- `GET /api/comments/article/:articleId` - Get comments for an article
- `GET /api/comments/:id` - Get comment by ID
- `POST /api/comments` - Create comment (Authenticated)
- `PUT /api/comments/:id` - Update comment (Author own)
- `DELETE /api/comments/:id` - Delete comment (Author own or Admin)
- `POST /api/comments/:id/like` - Like/unlike comment (Authenticated)

### Notifications

- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

## Role-Based Access Control

### Roles and Permissions

| Role   | Articles (Create) | Articles (Edit Own) | Articles (Edit Any) | Articles (Delete) | Comments |
| ------ | ----------------- | ------------------- | ------------------- | ----------------- | -------- |
| ADMIN  | ✅                | ✅                  | ✅                  | ✅                | ✅       |
| EDITOR | ✅                | ✅                  | ✅                  | ❌                | ✅       |
| AUTHOR | ✅                | ✅                  | ❌                  | ❌                | ✅       |
| READER | ❌                | ❌                  | ❌                  | ❌                | ✅       |

## Real-time Features

The platform uses Socket.io for real-time communication:

- **New Comments**: Broadcasted to all connected clients
- **Comment Updates**: Real-time updates when comments are edited
- **Notifications**: User-specific notifications sent to user rooms
- **Likes**: Real-time like count updates

### Socket Events

- `comment:new` - New comment created
- `comment:update` - Comment updated
- `comment:delete` - Comment deleted
- `comment:like` - Comment like toggled
- `notification` - New notification (sent to user room)

## Project Structure

```
src/
├── config/          # Configuration files (database, swagger)
├── controllers/     # Route controllers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── article.controller.js
│   ├── comment.controller.js
│   └── notification.controller.js
├── middleware/      # Custom middleware
│   ├── auth.middleware.js
│   └── validation.middleware.js
├── models/          # Mongoose models
│   ├── User.model.js
│   ├── Article.model.js
│   ├── Comment.model.js
│   ├── Notification.model.js
│   └── RefreshToken.model.js
├── routes/          # Express routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── article.routes.js
│   ├── comment.routes.js
│   └── notification.routes.js
├── sockets/         # Socket.io handlers
│   └── socket.handler.js
├── validators/      # Input validators
│   ├── auth.validators.js
│   ├── article.validators.js
│   └── comment.validators.js
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access tokens (15min) and refresh tokens (7 days)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: All inputs validated and sanitized
- **XSS Protection**: xss-clean middleware
- **MongoDB Injection Protection**: express-mongo-sanitize
- **HTTP Parameter Pollution Protection**: hpp middleware
- **Security Headers**: helmet middleware
- **CORS**: Configured for Angular frontend

## Development

### Testing the API

1. Start MongoDB
2. Start the server: `npm run dev`
3. Access Swagger docs: `http://localhost:3000/api-docs`
4. Test endpoints using Swagger UI or Postman

### Example API Calls

#### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "AUTHOR"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Create an article (with JWT token)

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My First Article",
    "content": "This is the content of my article...",
    "excerpt": "Short excerpt",
    "status": "PUBLISHED",
    "tags": ["blog", "tutorial"],
    "category": "Technology"
  }'
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture diagram and documentation.

## License

MIT
