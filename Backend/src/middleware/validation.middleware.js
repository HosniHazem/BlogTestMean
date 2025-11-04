const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg
    }));
    return res.status(400).json({ success: false, message: 'Erreurs de validation', errors: formattedErrors });
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    });
  };
  if (req.body) sanitize(req.body);
  next();
};

module.exports = { handleValidationErrors, sanitizeInput };
