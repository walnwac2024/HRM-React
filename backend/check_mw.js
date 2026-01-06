const mw = require('./middlewares/middleware');
console.log("mw.isAuthenticated:", typeof mw.isAuthenticated);
console.log("mw.requireRole:", typeof mw.requireRole);
process.exit();
