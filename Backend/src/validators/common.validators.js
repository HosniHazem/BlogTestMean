const { query, body } = require("express-validator");

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page doit être >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit doit être entre 1 et 100"),
];

const articleQueryValidation = [
  ...paginationValidation,
  query("status")
    .optional()
    .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .withMessage("Statut invalide"),
  query("category").optional().isString().isLength({ max: 50 }),
  query("tag").optional().isString().isLength({ max: 30 }),
  query("author").optional().isMongoId().withMessage("ID auteur invalide"),
  query("search").optional().isString().isLength({ max: 200 }),
];

const authLoginValidation = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 8 }).withMessage("Mot de passe trop court"),
];

const authRegisterValidation = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username invalide"),
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 8 }).withMessage("Mot de passe trop court"),
  body("role")
    .optional()
    .isIn(["ADMIN", "EDITOR", "AUTHOR", "READER"])
    .withMessage("Rôle invalide"),
];

module.exports = {
  paginationValidation,
  articleQueryValidation,
  authLoginValidation,
  authRegisterValidation,
};

