const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const rateLimit = require("express-rate-limit");
const { authenticate } = require("../middleware/auth.middleware");
const {
  handleValidationErrors,
  sanitizeInput,
} = require("../middleware/validation.middleware");
const {
  createCommentValidation,
  updateCommentValidation,
} = require("../validators/comment.validators");

/**
 * @swagger
 * /comments/article/{articleId}:
 *   get:
 *     summary: Get comments for an article
 *     tags: [Comments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/article/:articleId", commentController.getArticleComments);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment details
 */
router.get("/:id", commentController.getCommentById);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - articleId
 *             properties:
 *               content:
 *                 type: string
 *               articleId:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post(
  "/",
  authenticate,
  rateLimit({
    windowMs: parseInt(process.env.COMMENT_WINDOW_MS) || 60 * 1000,
    max: parseInt(process.env.COMMENT_CREATE_MAX) || 10,
    message: "Trop de créations de commentaires, réessayez plus tard.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
  sanitizeInput,
  createCommentValidation,
  handleValidationErrors,
  commentController.createComment
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.put(
  "/:id",
  authenticate,
  rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: "Trop de modifications de commentaires, réessayez plus tard.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
  sanitizeInput,
  updateCommentValidation,
  handleValidationErrors,
  commentController.updateComment
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (soft delete)
 *     tags: [Comments]
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
 *         description: Comment deleted
 */
router.delete("/:id", authenticate, commentController.deleteComment);

/**
 * @swagger
 * /comments/{id}/like:
 *   post:
 *     summary: Like or unlike a comment
 *     tags: [Comments]
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
router.post("/:id/like", authenticate, commentController.toggleLike);

module.exports = router;
