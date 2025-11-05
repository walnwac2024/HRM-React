// // src/routes/app.routes.js
// const express = require('express');
// const router = express.Router();

// // split controllers correctly
// const { register, login, me, logout } = require('../Controller/UserDeatils/Login');
// const { getDashboard, listAllUsers }   = require('../Controller/UserDeatils/Role');

// // correct middleware path
// const { isAuthenticated, requireRole } = require('../middlewares/middleware');

// // sanity checks: will tell you *exactly* which import is wrong
// const assertFn = (fn, name) => {
//   if (typeof fn !== 'function') throw new TypeError(`${name} must be a function (check its import/export)`);
// };
// assertFn(register, 'register');
// assertFn(login, 'login');
// assertFn(me, 'me');
// assertFn(logout, 'logout');
// assertFn(getDashboard, 'getDashboard');
// assertFn(listAllUsers, 'listAllUsers');
// assertFn(isAuthenticated, 'isAuthenticated');
// assertFn(requireRole, 'requireRole'); // factory itself must be a function

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', isAuthenticated, me);
// router.post('/logout', isAuthenticated, logout);
// router.get('/dashboard', isAuthenticated, getDashboard);
// router.get('/admin/users', isAuthenticated, requireRole('admin'), listAllUsers);

// module.exports = router;


// Routes/Routes.js
const express = require('express');
const router = express.Router();

// Controllers
const { register, login, me, logout } = require('../Controller/UserDeatils/Login');
const { getMenu, getDashboard, listAllUsers } = require('../Controller/UserDeatils/Role');

// Middleware
const { isAuthenticated, requireRole, requireFeatures } = require('../middlewares/middleware');

// (Optional) sanity checks to catch bad imports early
const assertFn = (fn, name) => {
  if (typeof fn !== 'function') throw new TypeError(`${name} must be a function (check its import/export)`);
};
assertFn(register, 'register');
assertFn(login, 'login');
assertFn(me, 'me');
assertFn(logout, 'logout');
assertFn(getMenu, 'getMenu');
assertFn(getDashboard, 'getDashboard');
assertFn(listAllUsers, 'listAllUsers');
assertFn(isAuthenticated, 'isAuthenticated');
assertFn(requireRole, 'requireRole');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', isAuthenticated, me);
router.post('/logout', isAuthenticated, logout);

// NEW: menu from features
router.get('/me/menu', isAuthenticated, getMenu);

// Dashboard requires feature 'dashboard_view'
router.get('/dashboard', isAuthenticated, requireFeatures('dashboard_view'), getDashboard);

// Admin list — role guard (super_admin bypass applies in middleware)
router.get('/admin/users', isAuthenticated, requireRole('admin'), listAllUsers);

module.exports = router;
