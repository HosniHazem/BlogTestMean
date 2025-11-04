const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISS || "blog-api",
      audience: process.env.JWT_AUD || "blog-client",
    });
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Utilisateur non trouvé." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Token invalide." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expiré." });
    }
    return res
      .status(500)
      .json({ success: false, message: "Erreur d'authentification." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Accès refusé." });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
