// backend/Routes/Route.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

// ---------- AUTH CONTROLLERS ----------
const {
  register,
  login,
  me,
  logout,
  changePassword,
  uploadAvatar,
} = require("../Controller/UserDeatils/Login");

// ---------- MENU / DASHBOARD CONTROLLERS ----------
const {
  getMenu,
  getDashboard,
  listAllUsers,
} = require("../Controller/UserDeatils/Role");

// ---------- EMPLOYEE CONTROLLERS ----------
const {
  createEmployee,
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
  addEmployeeDocuments,

  listEmployeeDocuments,
  downloadEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,
  replaceEmployeeDocumentFile,
} = require("../Controller/Employees/Employees");

// ✅ NEW: Attendance core
const {
  listOffices,
  getToday,
  punch,
  adminMissing,
} = require("../Controller/Attendance/Attendance");

// ✅ NEW: Attendance settings
const {
  getShifts,
  updateShift,
  getRules,
  updateActiveRule,
} = require("../Controller/Attendance/AttendanceSettings");

// ✅ NEW: Leaves
const {
  getLeaveTypes,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} = require("../Controller/Leaves/Leave");

// ---------- MIDDLEWARE ----------
const {
  isAuthenticated,
  requireRole,
  requireFeatures,
} = require("../middlewares/middleware");

/*
|--------------------------------------------------------------------------|
| CSRF TOKEN ROUTE                                                         |
|--------------------------------------------------------------------------|
*/
router.get("/csrf", (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

/*
|--------------------------------------------------------------------------|
| MULTER CONFIG FOR UPLOADS                                                |
|--------------------------------------------------------------------------|
*/
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
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

const docsDir = path.join(uploadDir, "documents");
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const docsUpload = multer({ storage: docsStorage });

/*
|--------------------------------------------------------------------------|
| AUTH ROUTES                                                              |
|--------------------------------------------------------------------------|
*/
router.post("/auth/login", login);
router.get("/auth/me", isAuthenticated, me);
router.post("/auth/logout", isAuthenticated, logout);
router.post("/auth/change-password", isAuthenticated, changePassword);

router.post(
  "/auth/me/avatar",
  isAuthenticated,
  upload.single("image"),
  uploadAvatar
);

// Legacy aliases
router.post("/login", login);
router.get("/me", isAuthenticated, me);
router.post("/logout", isAuthenticated, logout);

/*
|--------------------------------------------------------------------------|
| MENU / DASHBOARD ROUTES                                                  |
|--------------------------------------------------------------------------|
*/
router.get("/me/menu", isAuthenticated, getMenu);

router.get(
  "/dashboard",
  isAuthenticated,
  requireFeatures("dashboard_view"),
  getDashboard
);

/*
|--------------------------------------------------------------------------|
| ADMIN ROUTES                                                             |
|--------------------------------------------------------------------------|
*/
router.get("/admin/users", isAuthenticated, requireRole("admin"), listAllUsers);

/*
|--------------------------------------------------------------------------|
| EMPLOYEE ROUTES                                                          |
|--------------------------------------------------------------------------|
*/
router.post(
  "/employees",
  isAuthenticated,
  requireFeatures("employee_edit"),
  createEmployee
);

router.get(
  "/employees",
  isAuthenticated,
  requireFeatures("employee_view"),
  listEmployees
);

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

router.get("/employees/:id", isAuthenticated, getEmployeeById);

/* -------------------- DOCUMENTS -------------------- */

router.get(
  "/employees/:id/documents",
  isAuthenticated,
  requireFeatures("employee_view"),
  listEmployeeDocuments
);

router.get(
  "/employees/:id/documents/:docId/download",
  isAuthenticated,
  requireFeatures("employee_view"),
  downloadEmployeeDocument
);

router.patch(
  "/employees/:id/documents/:docId",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployeeDocument
);

router.delete(
  "/employees/:id/documents/:docId",
  isAuthenticated,
  requireFeatures("employee_edit"),
  deleteEmployeeDocument
);

router.put(
  "/employees/:id/documents/:docId/file",
  isAuthenticated,
  requireFeatures("employee_edit"),
  docsUpload.single("file"),
  replaceEmployeeDocumentFile
);

router.post(
  "/employees/:id/documents",
  isAuthenticated,
  requireFeatures("employee_edit"),
  docsUpload.array("files", 10),
  addEmployeeDocuments
);

/* --------------------------------------------------- */

router.patch(
  "/employees/:id",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployee
);

router.put(
  "/employees/:id/login",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployeeLogin
);

router.patch(
  "/employees/:id/status",
  isAuthenticated,
  requireFeatures("employee_edit"),
  updateEmployeeStatus
);

/*
|--------------------------------------------------------------------------|
| ATTENDANCE (NEW)                                                         |
|--------------------------------------------------------------------------|
*/
router.get("/attendance/offices", isAuthenticated, listOffices);
router.get("/attendance/today", isAuthenticated, getToday);
router.post("/attendance/punch", isAuthenticated, punch);

router.get(
  "/attendance/admin/missing",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  adminMissing
);

/*
|--------------------------------------------------------------------------|
| ATTENDANCE SETTINGS (Super Admin)                                         |
|--------------------------------------------------------------------------|
*/
router.get(
  "/attendance/settings/shifts",
  isAuthenticated,
  requireRole("super_admin", "admin", "hr"),
  getShifts
);

router.put(
  "/attendance/settings/shifts/:id",
  isAuthenticated,
  requireRole("super_admin", "admin", "hr"),
  updateShift
);

router.get(
  "/attendance/settings/rules",
  isAuthenticated,
  requireRole("super_admin", "admin", "hr"),
  getRules
);

router.put(
  "/attendance/settings/rules/active",
  isAuthenticated,
  requireRole("super_admin", "admin", "hr"),
  updateActiveRule
);

/*
|--------------------------------------------------------------------------|
| LEAVE MANAGEMENT (NEW)                                                   |
|--------------------------------------------------------------------------|
*/
router.get("/leaves/types", isAuthenticated, getLeaveTypes);
router.post("/leaves/apply", isAuthenticated, applyLeave);
router.get("/leaves/my", isAuthenticated, getMyLeaves);

router.get(
  "/leaves/admin/all",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  getAllLeaves
);

router.patch(
  "/leaves/approve/:id",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  approveLeave
);

/* --- LEAVE SETTINGS (Admin Only) --- */
router.post(
  "/leaves/types",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  createLeaveType
);

router.patch(
  "/leaves/types/:id",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  updateLeaveType
);

router.delete(
  "/leaves/types/:id",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  deleteLeaveType
);

module.exports = router;
