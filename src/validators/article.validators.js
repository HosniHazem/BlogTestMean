const { body } = require("express-validator");

const createArticleValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Le contenu est requis")
    .isLength({ min: 50 })
    .withMessage("Le contenu doit contenir au moins 50 caractères"),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("L'extrait ne peut pas dépasser 500 caractères"),
  body("category").optional().trim(),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Les tags doivent être un tableau"),
  body("status")
    .optional()
    .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .withMessage("Statut invalide"),
];

const updateArticleValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage("Le contenu doit contenir au moins 50 caractères"),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("L'extrait ne peut pas dépasser 500 caractères"),
  body("status")
    .optional()
    .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .withMessage("Statut invalide"),
];

module.exports = { createArticleValidation, updateArticleValidation };


