// // src/middlewares/auth.middleware.js
// const isAuthenticated=(req, res, next)=> {
//   if (req.session?.user) return next();
//   return res.status(401).json({ message: 'Unauthorized' });
// }

// const  requireRole=(role) =>{
//   return (req, res, next) => {
//     if (req.session?.user?.role === role) return next();
//     return res.status(403).json({ message: 'Forbidden' });
//   };
// }

// // Optional: allow multiple roles
// const requireAnyRole=(...roles)=> {
//   return (req, res, next) => {
//     if (req.session?.user && roles.includes(req.session.user.role)) return next();
//     return res.status(403).json({ message: 'Forbidden' });
//   };
// }

// module.exports = { isAuthenticated, requireRole, requireAnyRole };

// middlewares/middleware.js

// Must be logged in (session-based)
const isAuthenticated = (req, res, next) => {
  if (req.session?.user?.id) return next();
  return res.status(401).json({ message: 'Unauthorized' });
};

// Require exactly a role (with super_admin bypass)
const requireRole = (role) => {
  return (req, res, next) => {
    const current = (req.session?.user?.role || '').toLowerCase();
    if (!current) return res.status(403).json({ message: 'Forbidden' });
    if (current === 'super_admin') return next(); // bypass
    if (current === String(role).toLowerCase()) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
};

// Require any of several roles (with super_admin bypass)
const requireAnyRole = (...roles) => {
  const need = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const current = (req.session?.user?.role || '').toLowerCase();
    if (!current) return res.status(403).json({ message: 'Forbidden' });
    if (current === 'super_admin') return next(); // bypass
    if (need.includes(current)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
};

// Require feature code(s) (e.g., 'reports_view', 'leave_approve') with super_admin bypass
const requireFeatures = (...codes) => {
  return (req, res, next) => {
    const current = (req.session?.user?.role || '').toLowerCase();
    if (current === 'super_admin') return next(); // bypass
    const have = new Set(req.session?.user?.features || []);
    const ok = codes.every(c => have.has(c));
    if (!ok) return res.status(403).json({ message: 'Missing permissions', needed: codes });
    next();
  };
};

module.exports = { isAuthenticated, requireRole, requireAnyRole, requireFeatures };
