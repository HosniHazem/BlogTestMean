const { PERMISSIONS, roleHasPermission } = require("../config/permissions");

/**
 * requirePermission enforces a permission. Supports ownership-aware checks.
 * options.resolveOwnership(resource) should return { isOwner: boolean }.
 */
function requirePermission(permission, options = {}) {
  return async function (req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Non authentifié" });
      }

      // Fast path: direct permission check
      if (roleHasPermission(user.role, permission)) {
        return next();
      }

      // Ownership fallback: if asking for :any, try :own when applicable
      if (permission.endsWith(":any")) {
        const ownPerm = permission.replace(":any", ":own");
        if (
          roleHasPermission(user.role, ownPerm) &&
          typeof options.resolveOwnership === "function"
        ) {
          const result = await options.resolveOwnership(req);
          if (result && result.isOwner) {
            return next();
          }
        }
      }

      return res.status(403).json({ success: false, message: "Accès refusé" });
    } catch (err) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Erreur permission",
          error: err.message,
        });
    }
  };
}

module.exports = { PERMISSIONS, requirePermission };
