const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog Platform API",
      version: "1.0.0",
      description:
        "Collaborative multi-author blog platform API built with MEAN stack",
      contact: {
        name: "API Support",
        email: "support@blogplatform.com",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT access token. Get it by calling POST /api/auth/login. Enter only the token value (without 'Bearer' prefix).",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            role: {
              type: "string",
              enum: ["ADMIN", "EDITOR", "AUTHOR", "READER"],
            },
            avatar: { type: "string" },
            bio: { type: "string" },
            socialLinks: {
              type: "object",
              properties: {
                twitter: { type: "string" },
                linkedin: { type: "string" },
                github: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Article: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string", example: "Introduction à l’API" },
            slug: {
              type: "string",
              readOnly: true,
              example: "introduction-a-l-api",
            },
            content: {
              type: "string",
              example:
                "Cet article présente les étapes principales pour utiliser notre API efficacement...",
            },
            excerpt: {
              type: "string",
              example: "Découvrez comment utiliser notre API.",
            },
            author: { $ref: "#/components/schemas/User" },
            featuredImage: {
              type: "string",
              example: "https://example.com/image.jpg",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["api", "guide"],
            },
            category: { type: "string", example: "Développement" },
            status: {
              type: "string",
              enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
              example: "DRAFT",
            },
            views: { type: "number", example: 0 },
            likes: { type: "array", items: { type: "string" } },
            publishedAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          description:
            "Slug is auto-generated from title; do not send it in requests.",
        },
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            content: { type: "string" },
            article: { type: "string" },
            author: { $ref: "#/components/schemas/User" },
            parentComment: { type: "string" },
            likes: { type: "array", items: { type: "string" } },
            isEdited: { type: "boolean" },
            isDeleted: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            recipient: { type: "string" },
            type: {
              type: "string",
              enum: [
                "COMMENT",
                "REPLY",
                "ARTICLE_LIKE",
                "COMMENT_LIKE",
                "ARTICLE_PUBLISHED",
                "MENTION",
              ],
            },
            title: { type: "string" },
            message: { type: "string" },
            relatedArticle: { type: "string" },
            relatedComment: { type: "string" },
            relatedUser: { type: "string" },
            isRead: { type: "boolean" },
            link: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
