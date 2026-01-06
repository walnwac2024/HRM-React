const Attendance = require('./Controller/Attendance/Attendance');
const Leave = require('./Controller/Leaves/Leave');
const News = require('./Controller/News/NewsController');
const Notifications = require('./Controller/UserDeatils/NotificationController');
const Chat = require('./Controller/UserDeatils/ChatController');

console.log("Attendance.getToday:", typeof Attendance.getToday);
console.log("Leave.getLeaveDashboardStats:", typeof Leave.getLeaveDashboardStats);
console.log("News.listNews:", typeof News.listNews);
console.log("Notifications.listMyNotifications:", typeof Notifications.listMyNotifications);
console.log("Chat.getAuthorityRooms:", typeof Chat.getAuthorityRooms);

process.exit();
