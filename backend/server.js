// server.js
const express = require("express");
const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session")(session);
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const csurf = require("csurf"); // <= add

dotenv.config();

const app = express();
const routes = require("./Routes/Route");

const isProd = process.env.NODE_ENV === "production";

// 1) Security headers FIRST
app.use(helmet());

// 2) CORS BEFORE routes (and allow credentials)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 3) JSON parser
app.use(express.json());

// 4) Trust proxy when deploying behind Nginx/Heroku/etc.
app.set("trust proxy", 1);

// 5) Session store (MySQL)
const sessionStore = new MySQLStoreFactory({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  // Optional cleanup config:
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000, // every 15 minutes
  expiration: 7 * 24 * 60 * 60 * 1000,     // 7 days
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
});

// 6) Session middleware
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "change_this_secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProd,                       // only over HTTPS in production
      sameSite: isProd ? "none" : "lax",    // if cross-domain in prod: 'none' requires HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7,      // 7 days
    },
  })
);

/**
 * 7) CSRF — PLACE **AFTER session** and **BEFORE routes**
 * Uses the session store (cookie: false).
 * Safe methods (GET/HEAD/OPTIONS) don't require token by default.
 */
app.use(csurf({ cookie: false }));

// 8) A small endpoint for the frontend to fetch the CSRF token
app.get("/api/v1/csrf", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 9) Your application routes
app.use("/api/v1", routes);

// 10) Centralized error handler (handles CSRF errors cleanly)
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error" });
});

// 11) Boot
const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
