const Login = require('./Controller/UserDeatils/Login');
const Role = require('./Controller/UserDeatils/Role');
const Employees = require('./Controller/Employees/Employees');

console.log("Login.logout:", typeof Login.logout);
console.log("Login.me:", typeof Login.me);
console.log("Role.getMenu:", typeof Role.getMenu);
console.log("Role.getDashboard:", typeof Role.getDashboard);
console.log("Employees.listEmployees:", typeof Employees.listEmployees);

process.exit();
