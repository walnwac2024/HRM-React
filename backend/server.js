const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const port = 5000;
const cors = require('cors');
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // Allow React app to communicate with the backend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow these HTTP methods
  credentials: true,  // Allow cookies if needed
}));
// Configure session
app.use(
  session({
    secret: 'thisisme', // A secret string to sign the session ID
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // set to true if using https (ensure you use HTTPS in production)
      httpOnly: true, // prevents client-side JS from accessing the cookie
      maxAge: 3600000, // session expiry time (1 hour in ms)
    },
  })
);

// Fake user database (for demonstration)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'adminpass', // In real apps, use bcrypt to hash passwords
    role: 'admin',
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: 'userpass',
    role: 'user',
  },
];

// Login route to authenticate user and store session data
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Compare passwords (using bcrypt in real apps)
  if (user.password !== password) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Store user data in session
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return res.status(200).json({ message: 'Login successful', user: req.session.user });
});

// Route to check if the user is authenticated
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(200).json({ user: req.session.user });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Failed to log out' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden' });
}

// Protected route example
app.get('/admin-dashboard', isAdmin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the Admin Dashboard' });
});
