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
  if (rolesLower.includes("admin")) return true;
  if (rolesLower.includes("hr")) return true;
  if (rolesLower.includes("developer")) return true;

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
    if (!user) return res.status(401).json({ message: "Unauthenticated" });
    if (hasFullAccess(user)) return next();

    const feats = new Set(user.features || []);
    if (neededCodes.every((code) => feats.has(code))) return next();

    return res.status(403).json({ message: "Forbidden (missing feature)" });
  };
}

function requireFeaturesOrSelf(featureCode, idParam = "id") {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: "Unauthenticated" });
    if (hasFullAccess(user)) return next();

    const requestedId = String(req.params[idParam]);
    if (String(user.id) === requestedId) return next();

    const feats = new Set(user.features || []);
    if (feats.has(featureCode)) return next();

    return res.status(403).json({ message: "Forbidden (access denied)" });
  };
}

module.exports = {
  isAuthenticated,
  requireRole,
  requireFeatures,
  requireFeaturesOrSelf,
};
