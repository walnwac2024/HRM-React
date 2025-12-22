// backend/middlewares/middleware.js
function isAuthenticated(req, res, next) {
  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }
  next();
}

function hasFullAccess(user) {
  if (!user) return false;

  const level = Number(user.flags?.level || 0);
  if (level > 6) return true;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  if (roles.includes("super_admin")) return true;

  return false;
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (hasFullAccess(user)) {
      return next();
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const ok = allowedRoles.some((r) => userRoles.includes(r));

    if (!ok) {
      return res.status(403).json({ message: "Forbidden (insufficient role)" });
    }

    next();
  };
}

function requireFeatures(...neededCodes) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (hasFullAccess(user)) {
      return next();
    }

    const feats = new Set(user.features || []);
    const ok = neededCodes.every((code) => feats.has(code));

    if (!ok) {
      return res.status(403).json({ message: "Forbidden (missing feature)" });
    }

    next();
  };
}

module.exports = {
  isAuthenticated,
  requireRole,
  requireFeatures,
};
