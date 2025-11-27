// backend/Routes/Route.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// ---------- AUTH CONTROLLERS ----------
const {
  register,
  login,
  me,
  logout,
  changePassword,
  uploadAvatar,      // 👈 NEW
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
  updateEmployee,
  updateEmployeeLogin,
  updateEmployeeStatus,
  lookupUserTypes,
} = require("../Controller/Employees/Employees");

// ---------- MIDDLEWARE ----------
const {
  isAuthenticated,
  requireRole,
  requireFeatures,
} = require("../middlewares/middleware");

/*
|--------------------------------------------------------------------------
| MULTER CONFIG FOR AVATAR UPLOADS
|--------------------------------------------------------------------------
*/

const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.post("/auth/login", login);
router.get("/auth/me", isAuthenticated, me);
router.post("/auth/logout", isAuthenticated, logout);
router.post("/auth/change-password", isAuthenticated, changePassword);

// ✅ NEW: avatar upload route
router.post(
  "/auth/me/avatar",
  isAuthenticated,
  upload.single("image"), // field name must match formData.append("image", file)
  uploadAvatar
);

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
  "/employees/lookups/user-types",
  isAuthenticated,
  requireFeatures("employee_view"),
  lookupUserTypes
);
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

// VIEW EMPLOYEE
router.get(
  "/employees/:id",
  isAuthenticated,
  requireFeatures("employee_view"),
  getEmployeeById
);

// UPDATE EMPLOYEE (profile/general info)
router.patch(
  "/employees/:id",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployee
);

// UPDATE EMPLOYEE LOGIN / VAULT (admin)
router.put(
  "/employees/:id/login",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployeeLogin
);

// UPDATE EMPLOYEE STATUS
router.patch(
  "/employees/:id/status",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployeeStatus
);

module.exports = router;
