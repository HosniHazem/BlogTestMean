const { body } = require("express-validator");

const createCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Le contenu du commentaire est requis")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Le commentaire doit contenir entre 1 et 2000 caractères"),
  body("articleId")
    .notEmpty()
    .withMessage("L'ID de l'article est requis")
    .isMongoId()
    .withMessage("ID d'article invalide"),
  body("parentCommentId")
    .optional()
    .isMongoId()
    .withMessage("ID de commentaire parent invalide"),
];

const updateCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Le contenu du commentaire est requis")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Le commentaire doit contenir entre 1 et 2000 caractères"),
];

module.exports = { createCommentValidation, updateCommentValidation };


