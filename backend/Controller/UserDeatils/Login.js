// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { pool } = require('../../Utils/db');

// POST /auth/register
const register = async (req, res) => {
  try {
    let { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

     email = String(email).trim().toLowerCase();

    // Check duplicate email
    const [dupes] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (dupes.length) {
      return res.status(409).json({ message: 'Email already in use' });
    }

   password= await bcrypt.hash(password, 12);

    // Insert ONLY email + password_hash (2 columns, 2 placeholders)
    const [result] = await pool.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, password]
    );

    // Assuming your DB column `role` has DEFAULT 'user'
    req.session.user = {
      id: result.insertId,
      email: email,
      role: 'user',
    };

    return res.status(201).json({ message: 'Registered', user: req.session.user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /auth/login
const login=async(req, res)=> {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'usernameOrEmail and password are required' });

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.user = {
      user
    };

    return res.status(200).json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /auth/me
const me=async(req, res)=> {
  return res.status(200).json({ user: req.session.user });
}

// POST /auth/logout
async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Failed to log out' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
}

module.exports = { register, login, me, logout };
