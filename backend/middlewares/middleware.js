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
  const rolesLower = roles.map(r => String(r).toLowerCase());

  if (rolesLower.includes("super_admin")) return true;
  if (rolesLower.includes("hr")) return true;

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

    const userRoles = (Array.isArray(user.roles) ? user.roles : []).map((r) =>
      String(r).toLowerCase()
    );
    const ok = allowedRoles.some((r) =>
      userRoles.includes(String(r).toLowerCase())
    );

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
