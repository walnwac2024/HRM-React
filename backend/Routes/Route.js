// backend/Routes/Route.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Controllers
const {
    login,
    logout,
    me,
    heartbeat,
    changePassword
} = require("../Controller/UserDeatils/Login");
const Role = require("../Controller/UserDeatils/Role");
const Attendance = require("../Controller/Attendance/Attendance");
const AttendanceSettings = require("../Controller/Attendance/AttendanceSettings");
const Leave = require("../Controller/Leaves/Leave");
const News = require("../Controller/News/NewsController");
const Notifications = require("../Controller/UserDeatils/NotificationController");
const Chat = require("../Controller/UserDeatils/ChatController");

const {
    listEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    updateEmployeeLogin,
    updateEmployeeStatus,
    addEmployeeDocuments,
    listEmployeeDocuments,
    updateEmployeeDocument,
    deleteEmployeeDocument,
    replaceEmployeeDocumentFile,
    downloadEmployeeDocument,
    updateEmployeeAvatar,
    lookupStations,
    lookupDepartments,
    lookupGroups,
    lookupDesignations,
    lookupStatuses,
    lookupRoleTemplates,
    lookupUserTypes
} = require("../Controller/Employees/Employees");

const {
    getTypePermissions,
    updateTypePermissions,
    listUserTypes,
    listAllPermissions
} = require("../Controller/UserDeatils/PermissionController");

// Middleware
const { isAuthenticated, requireRole } = require("../middlewares/middleware");

// Multer storage for documents
const docsDir = path.join(__dirname, "..", "uploads", "documents");
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const docsStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, docsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});
const docsUpload = multer({ storage: docsStorage });

// Shared upload middleware (ensure this is configured for news/avatars if needed)
const upload = require('../Middleware/uploadMiddleware');

// Auth routes
router.post("/auth/login", login);
router.get("/auth/me", isAuthenticated, me);
router.post("/auth/logout", logout);
router.post("/auth/heartbeat", heartbeat);
router.post("/auth/change-password", isAuthenticated, changePassword);
router.get("/me/menu", isAuthenticated, Role.getMenu);
router.get("/dashboard", isAuthenticated, Role.getDashboard);

// Notification routes
router.get("/notifications", isAuthenticated, Notifications.listMyNotifications);
router.patch("/notifications/:id/read", isAuthenticated, Notifications.markAsRead);
router.patch("/notifications/read-all", isAuthenticated, Notifications.markAllAsRead);

// Chat routes
router.get("/chat/rooms", isAuthenticated, Chat.getAuthorityRooms);
router.get("/chat/authority-rooms", isAuthenticated, Chat.getAuthorityRooms);
router.get("/chat/messages/:roomId", isAuthenticated, Chat.getMessages);
router.post("/chat/messages", isAuthenticated, Chat.sendMessage);
router.post("/chat/send", isAuthenticated, Chat.sendMessage);
router.get("/chat/unread-counts", isAuthenticated, Chat.getUnreadCounts);
router.get("/chat/unread", isAuthenticated, Chat.getUnreadCounts);

// Permission routes
router.get("/permissions/user-types", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), listUserTypes);
router.get("/permissions/all", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), listAllPermissions);
router.get("/permissions/type/:typeId", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), getTypePermissions);
router.post("/permissions/type/:typeId", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), updateTypePermissions);

// Employee routes
router.get("/employees", isAuthenticated, listEmployees);
router.get("/employees/lookups/stations", isAuthenticated, lookupStations);
router.get("/employees/lookups/departments", isAuthenticated, lookupDepartments);
router.get("/employees/lookups/groups", isAuthenticated, lookupGroups);
router.get("/employees/lookups/designations", isAuthenticated, lookupDesignations);
router.get("/employees/lookups/statuses", isAuthenticated, lookupStatuses);
router.get("/employees/lookups/role-templates", isAuthenticated, lookupRoleTemplates);
router.get("/employees/lookups/user-types", isAuthenticated, lookupUserTypes);

router.get("/employees/:id", isAuthenticated, getEmployeeById);
router.post("/employees", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), upload.fields([{ name: "avatar", maxCount: 1 }, { name: "documents" }]), createEmployee);
router.patch("/employees/:id", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), updateEmployee);
router.put("/employees/:id/login", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), updateEmployeeLogin);
router.patch("/employees/:id/status", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), updateEmployeeStatus);
router.post("/employees/:id/avatar", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), upload.single("avatar"), updateEmployeeAvatar);

// Employee Document routes
router.post("/employees/:id/documents", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), docsUpload.array("documents"), addEmployeeDocuments);
router.get("/employees/:id/documents", isAuthenticated, listEmployeeDocuments);
router.patch("/employees/:id/documents/:docId", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), updateEmployeeDocument);
router.delete("/employees/:id/documents/:docId", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), deleteEmployeeDocument);
router.put("/employees/:id/documents/:docId/file", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), docsUpload.single("file"), replaceEmployeeDocumentFile);
router.get("/employees/:id/documents/:docId/download", isAuthenticated, downloadEmployeeDocument);

// Attendance routes
router.get("/attendance/offices", isAuthenticated, Attendance.listOffices);
router.get("/attendance/today", isAuthenticated, Attendance.getToday);
router.post("/attendance/punch", isAuthenticated, Attendance.punch);
router.get("/attendance/admin/missing", isAuthenticated, Attendance.adminMissing);
router.get("/attendance/summary/personal", isAuthenticated, Attendance.getPersonalSummary);
router.get("/attendance/report/monthly", isAuthenticated, Attendance.getMonthlyReport);

// Attendance Settings
router.get("/attendance/settings/shifts", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), AttendanceSettings.getShifts);
router.patch("/attendance/settings/shifts/:id", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), AttendanceSettings.updateShift);
router.get("/attendance/settings/rules", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), AttendanceSettings.getRules);
router.put("/attendance/settings/rules/active", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), AttendanceSettings.updateActiveRule);

// Leave routes
router.get("/leaves/types", isAuthenticated, Leave.getLeaveTypes);
router.get("/leaves/balances", isAuthenticated, Leave.getLeaveBalances);
router.post("/leaves/apply", isAuthenticated, Leave.applyLeave);
router.get("/leaves/my", isAuthenticated, Leave.getMyLeaves);
router.get("/leaves/admin/all", isAuthenticated, requireRole("super_admin", "admin", "hr", "manager", "developer"), Leave.getAllLeaves);
router.patch("/leaves/approve/:id", isAuthenticated, requireRole("super_admin", "admin", "hr", "manager", "developer"), Leave.approveLeave);
router.post("/leaves/types", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), Leave.createLeaveType);
router.patch("/leaves/types/:id", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), Leave.updateLeaveType);
router.delete("/leaves/types/:id", isAuthenticated, requireRole("super_admin", "admin", "hr", "developer"), Leave.deleteLeaveType);
router.get("/leaves/summary/stats", isAuthenticated, Leave.getLeaveDashboardStats);

// News routes
router.get("/news", isAuthenticated, News.listNews);
router.post("/news", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), upload.single('image'), News.createNews);
router.patch("/news/:id", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), upload.single('image'), News.updateNews);
router.delete("/news/:id", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.deleteNews);
router.get("/news/whatsapp/status", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.getWHStatus);
router.post("/news/whatsapp/init", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.initWH);
router.post("/news/whatsapp/settings", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.setWHSettings);
router.post("/news/whatsapp/sync", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.syncWHGroups);
router.post("/news/whatsapp/logout", isAuthenticated, requireRole("hr", "admin", "super_admin", "developer"), News.logoutWH);

module.exports = router;
