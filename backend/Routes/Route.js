// backend/Routes/Route.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const upload = require('../Middleware/uploadMiddleware');

// ---------- AUTH CONTROLLERS ----------
const {
  register,
  login,
  me,
  logout,
  heartbeat,
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
  updateEmployeeAvatar,
} = require("../Controller/Employees/Employees");

// ✅ ATTENDANCE CONTROLLERS
const Attendance = require("../Controller/Attendance/Attendance");

// ✅ NEW: Attendance settings
const {
  getShifts,
  updateShift,
  getRules,
  updateActiveRule,
} = require("../Controller/Attendance/AttendanceSettings");

// ✅ LEAVE CONTROLLERS
const Leave = require("../Controller/Leaves/Leave");

// ---------- CHAT CONTROLLERS ----------
const Chat = require("../Controller/UserDeatils/ChatController");

// ---------- NOTIFICATION CONTROLLERS ----------
const Notifications = require("../Controller/UserDeatils/NotificationController");

// ---------- PERMISSION CONTROLLERS ----------
const {
  listUserTypes: listTypesPerm,
  listAllPermissions,
  getTypePermissions,
  updateTypePermissions,
} = require("../Controller/UserDeatils/PermissionController");

// ---------- NEWS CONTROLLERS ----------
const News = require("../Controller/News/NewsController");

// ---------- MIDDLEWARE ----------
const {
  isAuthenticated,
  requireRole,
  requireFeatures,
  requireFeaturesOrSelf,
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
| MULTER CONFIG FOR EMPLOYEE DOCUMENTS                                    |
|--------------------------------------------------------------------------|
*/
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
router.post("/auth/heartbeat", isAuthenticated, heartbeat);
router.post("/auth/change-password", isAuthenticated, changePassword);

// ---------- NOTIFICATION ROUTES ----------
router.get("/notifications", isAuthenticated, Notifications.listMyNotifications);
router.patch("/notifications/read-all", isAuthenticated, Notifications.markAllAsRead);
router.patch("/notifications/:id/read", isAuthenticated, Notifications.markAsRead);

// ---------- CHAT ROUTES ----------
router.get("/chat/messages/:roomId", isAuthenticated, Chat.getMessages);
router.get("/chat/unread", isAuthenticated, Chat.getUnreadCounts);
router.post("/chat/send", isAuthenticated, Chat.sendMessage);
router.get("/chat/authority-rooms", isAuthenticated, Chat.getAuthorityRooms);

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
router.get("/admin/users", isAuthenticated, requireRole("admin", "super_admin", "hr", "developer"), listAllUsers);

/*
|--------------------------------------------------------------------------|
| PERMISSION MANAGEMENT ROUTES                                             |
|--------------------------------------------------------------------------|
*/
router.get("/permissions/user-types", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), listTypesPerm);
router.get("/permissions/all", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), listAllPermissions);
router.get("/permissions/type/:typeId", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), getTypePermissions);
router.post("/permissions/type/:typeId", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), updateTypePermissions);

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
  requireFeaturesOrSelf("employee_edit"),
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

router.post(
  "/employees/:id/avatar",
  isAuthenticated,
  requireFeatures("employee_edit"),
  upload.single("image"),
  updateEmployeeAvatar
);

/*
|--------------------------------------------------------------------------|
| ATTENDANCE (NEW)                                                         |
|--------------------------------------------------------------------------|
*/
router.get("/attendance/offices", isAuthenticated, Attendance.listOffices);
router.get("/attendance/today", isAuthenticated, Attendance.getToday);
router.get("/attendance/summary/personal", isAuthenticated, Attendance.getPersonalSummary);
router.post("/attendance/punch", isAuthenticated, Attendance.punch);

router.get(
  "/attendance/admin/missing",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  Attendance.adminMissing
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
router.get("/leaves/types", isAuthenticated, Leave.getLeaveTypes);
router.post("/leaves/apply", isAuthenticated, Leave.applyLeave);
router.get("/leaves/my", isAuthenticated, Leave.getMyLeaves);
router.get("/leaves/balances", isAuthenticated, Leave.getLeaveBalances);
router.get("/leaves/summary/stats", isAuthenticated, Leave.getLeaveDashboardStats);

router.get(
  "/leaves/admin/all",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin", "manager", "developer"),
  Leave.getAllLeaves
);

router.patch(
  "/leaves/approve/:id",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin", "manager", "developer"),
  Leave.approveLeave
);

/* --- LEAVE SETTINGS (Admin Only) --- */
router.post(
  "/leaves/types",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  Leave.createLeaveType
);

router.patch(
  "/leaves/types/:id",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  Leave.updateLeaveType
);

router.delete(
  "/leaves/types/:id",
  isAuthenticated,
  requireRole("hr", "admin", "super_admin"),
  Leave.deleteLeaveType
);

/*
|--------------------------------------------------------------------------|
| NEWS & NOTIFICATIONS                                                     |
|--------------------------------------------------------------------------|
*/
router.get("/news", isAuthenticated, News.listNews);
router.post("/news", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), upload.single('image'), News.createNews);
router.patch("/news/:id", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), upload.single('image'), News.updateNews);
router.delete("/news/:id", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.deleteNews);
router.get("/news/whatsapp/status", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.getWHStatus);
router.post("/news/whatsapp/init", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.initWH);
router.post("/news/whatsapp/settings", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.setWHSettings);
router.post("/news/whatsapp/sync", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.syncWHGroups);

// (End of News routes)

module.exports = router;
