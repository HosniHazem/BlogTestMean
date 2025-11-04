const { body } = require('express-validator');

const registerValidation = [
  body('username').trim().notEmpty().withMessage('Le nom d\'utilisateur est requis')
    .isLength({ min: 3, max: 50 }).withMessage('3-50 caractères requis'),
  body('email').trim().notEmpty().withMessage('Email requis').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
    .isLength({ min: 6 }).withMessage('Minimum 6 caractères')
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email requis').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token requis')
];

module.exports = { registerValidation, loginValidation, refreshTokenValidation };
