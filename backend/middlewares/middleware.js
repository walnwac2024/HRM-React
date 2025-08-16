// src/middlewares/auth.middleware.js
const isAuthenticated=(req, res, next)=> {
  if (req.session?.user) return next();
  return res.status(401).json({ message: 'Unauthorized' });
}

const  requireRole=(role) =>{
  return (req, res, next) => {
    if (req.session?.user?.role === role) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

// Optional: allow multiple roles
const requireAnyRole=(...roles)=> {
  return (req, res, next) => {
    if (req.session?.user && roles.includes(req.session.user.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = { isAuthenticated, requireRole, requireAnyRole };
