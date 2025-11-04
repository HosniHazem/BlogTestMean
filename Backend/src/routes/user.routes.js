const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");
const {
  handleValidationErrors,
  sanitizeInput,
} = require("../middleware/validation.middleware");
const {
  PERMISSIONS,
  requirePermission,
} = require("../middleware/permissions.middleware");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.USER_READ_ANY),
  userController.getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User details
 */
router.get("/:id", authenticate, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (self or Admin)
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EDITOR, AUTHOR, READER]
 *     responses:
 *       200:
 *         description: User updated
 */
router.put(
  "/:id",
  authenticate,
  sanitizeInput,
  handleValidationErrors,
  requirePermission(PERMISSIONS.USER_UPDATE_ANY, {
    resolveOwnership: async (req) => {
      const isOwner =
        req.user &&
        req.params.id &&
        req.params.id.toString() === req.user._id.toString();
      return { isOwner };
    },
  }),
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.USER_DELETE_ANY),
  userController.deleteUser
);

/**
 * @swagger
 * /users/{id}/articles:
 *   get:
 *     summary: Get user's articles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's articles
 */
router.get("/:id/articles", authenticate, userController.getUserArticles);

module.exports = router;
