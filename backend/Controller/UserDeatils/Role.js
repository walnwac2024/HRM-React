// // src/controllers/app.controller.js
// const { pool } = require('../../Utils/db');

// // GET /dashboard
// // Return different data depending on role
// async function getDashboard(req, res) {
//   const role = req.session.user.role;

//   try {
//     if (role === 'admin') {
//       // admins see all users
//       const [users] = await pool.execute(
//         'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC LIMIT 50'
//       );
//       return res.json({
//         role,
//         widgets: {
//           totalUsers: users.length,
//           recentUsers: users,
//         },
//       });
//     }

//     if (role === 'manager') {
//       // managers see some aggregate numbers (example)
//       const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
//       const [recent] = await pool.query(
//         'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC LIMIT 10'
//       );
//       return res.json({
//         role,
//         widgets: {
//           totalUsers,
//           teamRecent: recent, // pretend this is just their team in a real app
//         },
//       });
//     }

//     // regular user sees only their own profile basics
//     const [meRows] = await pool.execute(
//       'SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1',
//       [req.session.user.id]
//     );
//     return res.json({
//       role,
//       profile: meRows[0],
//       widgets: {
//         tips: ['Complete your profile', 'Change your password regularly'],
//       },
//     });
//   } catch (err) {
//     console.error('Dashboard error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// // Admin-only route example
// async function listAllUsers(req, res) {
//   try {
//     const [rows] = await pool.execute(
//       'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
//     );
//     return res.json(rows);
//   } catch (err) {
//     console.error('Admin list users error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = { getDashboard, listAllUsers };


// // Controller/UserDeatils/Role.js
// const { pool } = require('../../Utils/db');

// const BASE_USER_FIELDS =
//   "id, first_name, last_name, CONCAT(first_name, ' ', last_name) AS name, email";

// // Utility: build tabs from features (super_admin sees all)
// function buildTabs(roleName, features) {
//   const r = String(roleName || '').toLowerCase();
//   const f = new Set(features || []);

//   const can = (code) => r === 'super_admin' || f.has(code);

//   const tabs = [];
//   const add = (key, label, code) => { if (can(code)) tabs.push({ key, label }); };

//   add('dashboard',   'Dashboard',   'dashboard_view');
//   add('organization','Organization','org_view');
//   add('recruitment', 'Recruitment', 'recruitment_view');
//   add('employee',    'Employee',    'employee_view');
//   add('timesheet',   'Timesheet',   'timesheet_view');
//   add('leave',       'Leave',       'leave_view');
//   add('attendance',  'Attendance',  'attendance_view');
//   add('performance', 'Performance', 'performance_view');
//   add('payroll',     'Payroll',     'payroll_view');
//   add('reports',     'Reports',     'reports_view');

//   return tabs;
// }

// // GET /me/menu  ← NEW
// async function getMenu(req, res) {
//   const role = req?.session?.user?.role;
//   const features = req?.session?.user?.features || [];
//   if (!role) return res.status(401).json({ message: 'Not authenticated' });

//   const tabs = buildTabs(role, features);
//   return res.json({ role, tabs });
// }

// // GET /dashboard
// async function getDashboard(req, res) {
//   const role = String(req?.session?.user?.role || '').toLowerCase();
//   const userId = req?.session?.user?.id;

//   if (!userId || !role) {
//     return res.status(401).json({ message: 'Not authenticated' });
//   }

//   try {
//     if (role === 'super_admin' || role === 'admin') {
//       const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
//       const [users] = await pool.execute(
//         `SELECT ${BASE_USER_FIELDS} FROM users ORDER BY id DESC LIMIT 50`
//       );
//       return res.json({
//         role,
//         widgets: { totalUsers, recentUsers: users }
//       });
//     }

//     if (role === 'manager' || role === 'zone_manager' || role === 'director') {
//       let team;
//       try {
//         [team] = await pool.query(
//           `SELECT ${BASE_USER_FIELDS} FROM users WHERE manager_id = ? ORDER BY id DESC LIMIT 25`,
//           [userId]
//         );
//       } catch {
//         [team] = await pool.query(
//           `SELECT ${BASE_USER_FIELDS} FROM users ORDER BY id DESC LIMIT 10`
//         );
//       }
//       const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
//       return res.json({
//         role,
//         widgets: { totalUsers, teamRecent: team }
//       });
//     }

//     if (role === 'hr') {
//       const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
//       const [recentHires] = await pool.query(
//         `SELECT ${BASE_USER_FIELDS} FROM users ORDER BY id DESC LIMIT 20`
//       );
//       return res.json({
//         role,
//         widgets: { totalUsers, recentHires }
//       });
//     }

//     if (role === 'accounts' || role === 'payroll') {
//       const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
//       return res.json({
//         role,
//         widgets: { totalUsers, payrollPanel: { lastRun: null, pending: 0 } }
//       });
//     }

//     // default: self view
//     const [meRows] = await pool.execute(
//       `SELECT ${BASE_USER_FIELDS} FROM users WHERE id = ? LIMIT 1`,
//       [userId]
//     );
//     return res.json({
//       role,
//       profile: meRows[0] || null,
//       widgets: {
//         tips: ['Complete your profile', 'Change your password regularly']
//       }
//     });
//   } catch (err) {
//     console.error('Dashboard error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// // Admin-only route example
// async function listAllUsers(req, res) {
//   const role = String(req?.session?.user?.role || '').toLowerCase();
//   if (role !== 'admin' && role !== 'super_admin') {
//     return res.status(403).json({ message: 'Forbidden' });
//   }
//   try {
//     const [rows] = await pool.execute(
//       `SELECT ${BASE_USER_FIELDS} FROM users ORDER BY id DESC`
//     );
//     return res.json(rows);
//   } catch (err) {
//     console.error('Admin list users error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = { getMenu, getDashboard, listAllUsers };


// Controller/UserDeatils/Role.js
const { pool } = require('../../Utils/db');

// Adjusted for employee_records
const BASE_EMP_FIELDS = `
  id,
  Employee_ID      AS employee_code,
  Employee_Name    AS name,
  Official_Email   AS email,
  Department,
  Designations     AS designation
`;

// Utility: build tabs from features (super_admin, admin, and hr see all)
function buildTabs(roleName, features) {
  const r = String(roleName || '').toLowerCase();
  const f = new Set(features || []);

  // ✅ super_admin, admin, and hr get all tabs
  const can = (code) => r === 'super_admin' || r === 'admin' || r === 'hr' || f.has(code);

  const tabs = [];
  const add = (key, label, code) => { if (can(code)) tabs.push({ key, label }); };

  add('dashboard', 'Dashboard', 'dashboard_view');
  add('organization', 'Organization', 'org_view');
  add('recruitment', 'Recruitment', 'recruitment_view');
  add('employee', 'Employee', 'employee_view');
  add('timesheet', 'Timesheet', 'timesheet_view');
  add('leave', 'Leave', 'leave_view');
  add('attendance', 'Attendance', 'attendance_view');
  add('performance', 'Performance', 'performance_view');
  add('payroll', 'Payroll', 'payroll_view');
  add('reports', 'Reports', 'reports_view');

  return tabs;
}

// Helper: get primary role + features from session.user
function getSessionRoleInfo(req) {
  const user = req?.session?.user || {};
  const roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
  const primaryRole = roles[0] || null;
  const features = user.features || [];
  return { primaryRole, roles, features };
}

// GET /me/menu
async function getMenu(req, res) {
  const { primaryRole, features } = getSessionRoleInfo(req);
  if (!primaryRole) return res.status(401).json({ message: 'Not authenticated' });

  const tabs = buildTabs(primaryRole, features);
  return res.json({ role: primaryRole, tabs });
}

// GET /dashboard
async function getDashboard(req, res) {
  const { primaryRole } = getSessionRoleInfo(req);
  const userId = req?.session?.user?.id;

  if (!userId || !primaryRole) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const role = String(primaryRole).toLowerCase();

  try {
    // Use employee_records instead of users
    if (role === 'super_admin' || role === 'admin') {
      const [[{ totalEmployees }]] = await pool.query(
        'SELECT COUNT(*) AS totalEmployees FROM employee_records'
      );
      const [employees] = await pool.execute(
        `SELECT ${BASE_EMP_FIELDS}
           FROM employee_records
          ORDER BY id DESC
          LIMIT 50`
      );
      return res.json({
        role,
        widgets: { totalEmployees, recentEmployees: employees }
      });
    }

    if (role === 'manager' || role === 'zone_manager' || role === 'director') {
      // If you later add manager → employee relationships, filter here.
      const [[{ totalEmployees }]] = await pool.query(
        'SELECT COUNT(*) AS totalEmployees FROM employee_records'
      );
      const [team] = await pool.query(
        `SELECT ${BASE_EMP_FIELDS}
           FROM employee_records
          ORDER BY id DESC
          LIMIT 25`
      );
      return res.json({
        role,
        widgets: { totalEmployees, teamRecent: team }
      });
    }

    if (role === 'hr') {
      const [[{ totalEmployees }]] = await pool.query(
        'SELECT COUNT(*) AS totalEmployees FROM employee_records'
      );
      const [recentHires] = await pool.query(
        `SELECT ${BASE_EMP_FIELDS}
           FROM employee_records
          ORDER BY id DESC
          LIMIT 20`
      );
      return res.json({
        role,
        widgets: { totalEmployees, recentHires }
      });
    }

    if (role === 'accounts' || role === 'payroll') {
      const [[{ totalEmployees }]] = await pool.query(
        'SELECT COUNT(*) AS totalEmployees FROM employee_records'
      );
      return res.json({
        role,
        widgets: {
          totalEmployees,
          payrollPanel: { lastRun: null, pending: 0 }
        }
      });
    }

    // default: self-profile from employee_records
    const [meRows] = await pool.execute(
      `SELECT ${BASE_EMP_FIELDS}
         FROM employee_records
        WHERE id = ?
        LIMIT 1`,
      [userId]
    );
    return res.json({
      role,
      profile: meRows[0] || null,
      widgets: {
        tips: ['Complete your profile', 'Change your password regularly']
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Admin-only route example – now lists employees, not users
async function listAllUsers(req, res) {
  const { roles } = getSessionRoleInfo(req);
  const lowerRoles = roles.map(r => String(r).toLowerCase());
  if (!lowerRoles.includes('admin') && !lowerRoles.includes('super_admin')) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT ${BASE_EMP_FIELDS}
         FROM employee_records
        ORDER BY id DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Admin list employees error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMenu, getDashboard, listAllUsers };
