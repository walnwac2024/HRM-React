// src/controllers/app.controller.js
const { pool } = require('../../Utils/db');

// GET /dashboard
// Return different data depending on role
async function getDashboard(req, res) {
  const role = req.session.user.role;

  try {
    if (role === 'admin') {
      // admins see all users
      const [users] = await pool.execute(
        'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC LIMIT 50'
      );
      return res.json({
        role,
        widgets: {
          totalUsers: users.length,
          recentUsers: users,
        },
      });
    }

    if (role === 'manager') {
      // managers see some aggregate numbers (example)
      const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
      const [recent] = await pool.query(
        'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC LIMIT 10'
      );
      return res.json({
        role,
        widgets: {
          totalUsers,
          teamRecent: recent, // pretend this is just their team in a real app
        },
      });
    }

    // regular user sees only their own profile basics
    const [meRows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [req.session.user.id]
    );
    return res.json({
      role,
      profile: meRows[0],
      widgets: {
        tips: ['Complete your profile', 'Change your password regularly'],
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Admin-only route example
async function listAllUsers(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('Admin list users error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getDashboard, listAllUsers };
