const express = require("express");
const router = express.Router();

// ---------- AUTH CONTROLLERS ----------
const {
  register,
  login,
  me,
  logout,
} = require("../Controller/UserDeatils/Login");

// ---------- MENU / DASHBOARD CONTROLLERS ----------
const {
  getMenu,
  getDashboard,
  listAllUsers,
} = require("../Controller/UserDeatils/Role");

// ---------- EMPLOYEE CONTROLLERS ----------
const {
  listEmployees,
  getEmployeeById,
  lookupStations,
  lookupDepartments,
  lookupGroups,
  lookupDesignations,
  lookupStatuses,
  lookupRoleTemplates,
} = require("../Controller/Employees/Employees");

// ---------- MIDDLEWARE ----------
const {
  isAuthenticated,
  requireRole,
  requireFeatures,
} = require("../middlewares/middleware");

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.post("/auth/login", login);
router.get("/auth/me", isAuthenticated, me);
router.post("/auth/logout", isAuthenticated, logout);

// Legacy aliases
router.post("/login", login);
router.get("/me", isAuthenticated, me);
router.post("/logout", isAuthenticated, logout);

/*
|--------------------------------------------------------------------------
| MENU / DASHBOARD ROUTES
|--------------------------------------------------------------------------
*/

router.get("/me/menu", isAuthenticated, getMenu);

router.get(
  "/dashboard",
  isAuthenticated,
  requireFeatures("dashboard_view"),
  getDashboard
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/users",
  isAuthenticated,
  requireRole("admin"),
  listAllUsers
);

/*
|--------------------------------------------------------------------------
| EMPLOYEE ROUTES
|--------------------------------------------------------------------------
*/

// MAIN LIST
router.get(
  "/employees",
  isAuthenticated,
  requireFeatures("employee_view"),
  listEmployees
);

// LOOKUPS
router.get(
  "/employees/lookups/stations",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupStations
);

router.get(
  "/employees/lookups/departments",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupDepartments
);

router.get(
  "/employees/lookups/groups",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupGroups
);

router.get(
  "/employees/lookups/designations",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupDesignations
);

router.get(
  "/employees/lookups/statuses",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupStatuses
);

router.get(
  "/employees/lookups/role-templates",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupRoleTemplates
);

// VIEW EMPLOYEE (must be after lookups)
router.get(
  "/employees/:id",
  isAuthenticated,
  requireFeatures("employee_view"),
  getEmployeeById
);

module.exports = router;
