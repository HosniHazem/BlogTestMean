const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");
const {
  handleValidationErrors,
  sanitizeInput,
} = require("../middleware/validation.middleware");
const {
  createArticleValidation,
  updateArticleValidation,
} = require("../validators/article.validators");
const { articleQueryValidation } = require("../validators/common.validators");

// Optional auth middleware - tries to authenticate but doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const jwt = require("jsonwebtoken");
      const User = require("../models/User.model");
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Token expiré." });
      }
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "Token invalide." });
      }
      return res
        .status(401)
        .json({ success: false, message: "Erreur d'authentification." });
    }
  }
  return next();
};

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: 'Paste your token here as: Bearer <JWT>'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         description: Filter by status (requires authentication for DRAFT/ARCHIVED). Unauthenticated users only see PUBLISHED.
 *         example: PUBLISHED
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (case-insensitive)
 *         example: Développement
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get(
  "/",
  optionalAuth,
  articleQueryValidation,
  articleController.getAllArticles
);

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get article by ID or slug
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: 'Paste your token here as: Bearer <JWT>'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID or slug
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Article not found
 */
router.get("/:id", optionalAuth, articleController.getArticleById);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     description: Slug is auto-generated from title; do not include it in the request.
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           examples:
 *             sample:
 *               summary: Example payload (no slug required)
 *               value:
 *                 title: "Introduction à l’API"
 *                 content: "Cet article présente les étapes principales pour utiliser notre API efficacement, avec des exemples de requêtes et de réponses pour mieux comprendre le fonctionnement."
 *                 excerpt: "Découvrez comment utiliser notre API."
 *                 featuredImage: "https://example.com/image.jpg"
 *                 tags: ["API", "Guide"]
 *                 category: "Développement"
 *                 status: "DRAFT"
 *     responses:
 *       201:
 *         description: Article created successfully (slug auto-generated)
 *         content:
 *           application/json:
 *             examples:
 *               created:
 *                 summary: Example response
 *                 value:
 *                   success: true
 *                   message: "Article créé avec succès"
 *                   data:
 *                     article:
 *                       _id: "660000000000000000000000"
 *                       title: "Introduction à l’API"
 *                       slug: "introduction-a-l-api"
 *                       content: "Cet article présente les étapes principales pour utiliser notre API efficacement, avec des exemples de requêtes et de réponses pour mieux comprendre le fonctionnement."
 *                       excerpt: "Découvrez comment utiliser notre API."
 *                       featuredImage: "https://example.com/image.jpg"
 *                       tags: ["api", "guide"]
 *                       category: "Développement"
 *                       status: "DRAFT"
 *                       views: 0
 *                       likes: []
 *                       author: { id: "650000000000000000000000", username: "Hazem", avatar: "https://..." }
 *                       createdAt: "2025-11-04T11:20:00.000Z"
 *                       updatedAt: "2025-11-04T11:20:00.000Z"
 *       403:
 *         description: Access denied
 */
router.post(
  "/",
  authenticate,
  authorize("AUTHOR", "EDITOR", "ADMIN"),
  sanitizeInput,
  createArticleValidation,
  handleValidationErrors,
  articleController.createArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Article updated
 *       403:
 *         description: Access denied
 */
router.put(
  "/:id",
  authenticate,
  sanitizeInput,
  updateArticleValidation,
  handleValidationErrors,
  articleController.updateArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article deleted
 *       403:
 *         description: Access denied
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  articleController.deleteArticle
);

/**
 * @swagger
 * /articles/{id}/like:
 *   post:
 *     summary: Like or unlike an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 */
router.post("/:id/like", authenticate, articleController.toggleLike);

module.exports = router;
