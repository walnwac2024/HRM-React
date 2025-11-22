// src/controllers/auth.controller.js
// const bcrypt = require('bcryptjs');
// const { pool } = require('../../Utils/db');

// // POST /auth/register
// const register = async (req, res) => {
//   try {
//     let { email, password } = req.body ?? {};
//     if (!email || !password) {
//       return res.status(400).json({ message: 'email and password are required' });
//     }

//      email = String(email).trim().toLowerCase();

//     // Check duplicate email
//     const [dupes] = await pool.execute(
//       'SELECT id FROM users WHERE email = ? LIMIT 1',
//       [email]
//     );
//     if (dupes.length) {
//       return res.status(409).json({ message: 'Email already in use' });
//     } //on 409 its shows the error of duplication of email in the db it means that the one single email is used 2 or 3 times so it shows the error of duplication

//    password= await bcrypt.hash(password, 12); //12 salt round that password not to be in the plain text

//     // Insert ONLY email + password_hash (2 columns, 2 placeholders)
//     const [result] = await pool.execute(
//       'INSERT INTO users (email, password) VALUES (?, ?)',
//       [email, password]
//     );

//     // Assuming your DB column `role` has DEFAULT 'user'
//     req.session.user = {
//       id: result.insertId,
//       email: email,
//       role: 'user',
//     };

//     return res.status(201).json({ message: 'Registered', user: req.session.user });
//   } catch (err) {
//     console.error('Register error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// // POST /auth/login
// const login=async(req, res)=> {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: 'usernameOrEmail and password are required' });

//     const [rows] = await pool.execute(
//       'SELECT * FROM users WHERE email = ? LIMIT 1',
//       [email]
//     );

//     if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

//     const user = rows[0];
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

//     req.session.user = {
//       user
//     };

//     return res.status(200).json({ message: 'Login successful', user: req.session.user });
//   } catch (err) {
//     console.error('Login error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// // GET /auth/me
// const me=async(req, res)=> {
//   return res.status(200).json({ user: req.session.user });
// }

// // POST /auth/logout
// async function logout(req, res) {
//   req.session.destroy((err) => {
//     if (err) return res.status(500).json({ message: 'Failed to log out' });
//     res.status(200).json({ message: 'Logged out successfully' });
//   });
// }

// module.exports = { register, login, me, logout };


// // Controller/UserDeatils/Login.js  (auth.controller)
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { pool } = require('../../Utils/db');

// const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

// // helper: check if a column exists (used for employee_code safety)
// async function hasColumn(table, column) {
//   const [cols] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
//   return cols.length > 0;
// }

// // POST /auth/register
// const register = async (req, res) => {
//   try {
//     let { email, password, first_name = null, last_name = null } = req.body ?? {};
//     if (!email || !password) {
//       return res.status(400).json({ message: 'email and password are required' });
//     }

//     email = String(email).trim().toLowerCase();

//     // duplicate email check
//     const [dupes] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
//     if (dupes.length) return res.status(409).json({ message: 'Email already in use' });

//     const hash = await bcrypt.hash(password, 12);

//     // pick default role from users_types
//     const [roleRows] = await pool.execute(
//       `SELECT id, type
//          FROM users_types
//         WHERE type IN ('user','standard','employee')
//         ORDER BY FIELD(type,'user','standard','employee')
//         LIMIT 1`
//     );
//     if (!roleRows.length) {
//       return res.status(500).json({ message: "Default role ('user'/'standard'/'employee') not found in users_types" });
//     }
//     const defaultRoleId = roleRows[0].id;

//     // handle employee_code if present
//     const includeEmpCode = await hasColumn('users', 'employee_code');
//     let sql, params;

//     if (includeEmpCode) {
//       sql = `INSERT INTO users (employee_code, first_name, last_name, email, password, user_type_id)
//              VALUES (?, ?, ?, ?, ?, ?)`;
//       params = [
//         'EMP_' + Date.now().toString(36), // simple unique code
//         first_name,
//         last_name,
//         email,
//         hash,
//         defaultRoleId
//       ];
//     } else {
//       sql = `INSERT INTO users (first_name, last_name, email, password, user_type_id)
//              VALUES (?, ?, ?, ?, ?)`;
//       params = [first_name, last_name, email, hash, defaultRoleId];
//     }

//     const [result] = await pool.execute(sql, params);

//     // minimal session (full payload is provided on login)
//     req.session.user = { id: result.insertId, email, role: 'user', flags: {}, features: [] };
//     return res.status(201).json({ message: 'Registered', user: req.session.user });
//   } catch (err) {
//     console.error('Register error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// // POST /auth/login
// const login = async (req, res) => {
//   try {
//     let { email, password } = req.body ?? {};
//     if (!email || !password) {
//       return res.status(400).json({ message: 'email and password are required' });
//     }
//     email = String(email).trim().toLowerCase();

//     // user + role from users_types
//     const [rows] = await pool.execute(
//       `SELECT u.id, u.first_name, u.last_name, u.email, u.password,
//               ut.id AS role_id, ut.type AS role_name,
//               ut.permission_level,
//               ut.Create_permission AS can_create,
//               ut.Edit_permission   AS can_edit,
//               ut.View_permission   AS can_view
//          FROM users u
//          JOIN users_types ut ON ut.id = u.user_type_id
//         WHERE u.email = ?
//         LIMIT 1`,
//       [email]
//     );
//     if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

//     const user = rows[0];
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

//     // feature codes for this role
//     const [permRows] = await pool.execute(
//       `SELECT p.code
//          FROM user_type_permission up
//          JOIN permissions p ON p.id = up.permission_id
//         WHERE up.user_type_id = ?`,
//       [user.role_id]
//     );
//     const features = permRows.map(r => r.code);

//     const payload = {
//       id: user.id,
//       name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
//       email: user.email,
//       role: user.role_name, // e.g., 'admin', 'HR', 'user'
//       flags: {
//         level: Number(user.permission_level) || 0,
//         create: Number(user.can_create) > 0,
//         edit: Number(user.can_edit) > 0,
//         view: Number(user.can_view) > 0
//       },
//       features
//     };

//     // Prevent session fixation: regenerate the session ID before setting user
//     req.session.regenerate((regenErr) => {
//       if (regenErr) {
//         console.error('Session regenerate error:', regenErr);
//         return res.status(500).json({ message: 'Server error' });
//       }

//       req.session.user = payload;

//       // optional bearer token for APIs (not required by your app)
//       const token = jwt.sign(
//         { sub: user.id, role: user.role_name, features, flags: payload.flags },
//         JWT_SECRET,
//         { expiresIn: '8h' }
//       );

//       // explicitly save before responding (avoids race conditions)
//       req.session.save((saveErr) => {
//         if (saveErr) {
//           console.error('Session save error:', saveErr);
//           return res.status(500).json({ message: 'Server error' });
//         }
//         return res.status(200).json({ message: 'Login successful', user: payload, token });
//       });
//     });
//   } catch (err) {
//     console.error('Login error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET /auth/me
// const me = async (req, res) => {
//   return res.status(200).json({ user: req.session.user ?? null });
// };

// // POST /auth/logout
// async function logout(req, res) {
//   try {
//     // destroy session and clear cookie; name must match your session config (server.js -> cookie.name or default)
//     const cookieName = 'sid';
//     req.session.destroy((err) => {
//       res.clearCookie(cookieName);
//       if (err) {
//         console.error('Logout destroy error:', err);
//         return res.status(500).json({ message: 'Failed to log out' });
//       }
//       return res.status(200).json({ message: 'Logged out successfully' });
//     });
//   } catch (e) {
//     console.error('Logout error:', e);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = { register, login, me, logout };


// backend/Controller/UserDeatils/Login.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../../Utils/db");

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

// Disable self-registration – HR/admin manages employees
const register = async (req, res) => {
  return res
    .status(405)
    .json({ message: "Registration is managed by HR. Please contact admin." });
};

// POST /auth/login
const login = async (req, res) => {
  try {
    let { email, password } = req.body ?? {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    email = String(email).trim();

    // 1) find employee in employee_records
    const [empRows] = await pool.execute(
      `SELECT 
          e.id,
          e.Employee_ID,
          e.Employee_Name,
          e.Official_Email,
          e.password_hash,
          e.can_login,
          e.is_active
       FROM employee_records e
       WHERE e.can_login = 1
         AND e.is_active = 1
         AND e.Official_Email = ?
       LIMIT 1`,
      [email]
    );

    if (!empRows.length) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const emp = empRows[0];

    if (!emp.password_hash) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, emp.password_hash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2) roles for this employee (can be multiple) via employee_user_types
    const [roleRows] = await pool.execute(
      `SELECT ut.id,
              ut.type,
              ut.permission_level,
              ut.Create_permission AS can_create,
              ut.Edit_permission   AS can_edit,
              ut.View_permission   AS can_view
         FROM employee_user_types eut
         JOIN users_types ut ON ut.id = eut.user_type_id
        WHERE eut.employee_id = ?`,
      [emp.id]
    );

    let roles = roleRows.map((r) => r.type);

    // 🔴 IMPORTANT: fallback so you actually see tabs
    // If there are no employee_user_types rows yet, treat this user as super_admin for now.
    // Later, you can remove this once employee_user_types is filled properly.
    if (!roles.length) {
      roles = ["super_admin"];
    }

    // aggregate flags from all roles
    let level = 0;
    let canCreate = false;
    let canEdit = false;
    let canView = false;

    for (const r of roleRows) {
      level = Math.max(level, Number(r.permission_level) || 0);
      if (Number(r.can_create) > 0) canCreate = true;
      if (Number(r.can_edit) > 0) canEdit = true;
      if (Number(r.can_view) > 0) canView = true;
    }

    // 3) feature codes (permissions) from user_type_permission + permissions
    const [permRows] = await pool.execute(
      `SELECT DISTINCT p.code
         FROM user_type_permission up
         JOIN permissions p ON p.id = up.permission_id
         JOIN employee_user_types eut ON eut.user_type_id = up.user_type_id
        WHERE eut.employee_id = ?`,
      [emp.id]
    );

    let features = permRows.map((r) => r.code);

    // If we fell back to super_admin and there are no specific feature rows,
    // it's fine – buildTabs will show all tabs for super_admin.
    if (!features.length && roles.includes("super_admin")) {
      features = []; // super_admin bypasses feature checks
    }

    // 4) build payload
    const payload = {
      id: emp.id,
      employeeCode: emp.Employee_ID,
      name: emp.Employee_Name,
      email: emp.Official_Email,

      // 👉 primary role string + roles array
      role: roles[0] || null,
      roles,

      flags: {
        level,
        create: canCreate,
        edit: canEdit,
        view: canView,
      },
      features,
    };

    // 5) put in session and return token
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("Session regenerate error:", regenErr);
        return res.status(500).json({ message: "Server error" });
      }

      req.session.user = payload;

      const token = jwt.sign(
        {
          sub: emp.id,
          roles,
          features,
          flags: payload.flags,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.status(500).json({ message: "Server error" });
        }
        return res
          .status(200)
          .json({ message: "Login successful", user: payload, token });
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/me
const me = async (req, res) => {
  return res.status(200).json({ user: req.session.user ?? null });
};

// POST /auth/logout
async function logout(req, res) {
  try {
    const cookieName = "sid";
    req.session.destroy((err) => {
      res.clearCookie(cookieName);
      if (err) {
        console.error("Logout destroy error:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (e) {
    console.error("Logout error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, me, logout };

