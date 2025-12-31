/// server.js
const express = require("express");
const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session")(session);
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const csurf = require("csurf");
const path = require("path");

dotenv.config();

const app = express();

// ⬇️ IMPORTANT: if your file is Routes/Routes.js then use "./Routes/Routes"
const routes = require("./Routes/Route"); // <- make sure this matches the real filename
const { initAttendanceJob } = require("./Utils/attendanceJob");
const { initWhatsApp } = require("./Utils/whatsapp");

// Initialize background jobs
initAttendanceJob();
initWhatsApp();

const isProd = process.env.NODE_ENV === "production";

/*
|--------------------------------------------------------------------------
| 1) Security headers
|--------------------------------------------------------------------------
*/
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/*
|--------------------------------------------------------------------------
| 2) CORS (credentials allowed, PATCH/PUT enabled)
|--------------------------------------------------------------------------
*/
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-csrf-token",
  ],
};

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| 3) Body parsers
|--------------------------------------------------------------------------
*/
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/*
|--------------------------------------------------------------------------
| 3.5) Static files for uploaded images/documents
|--------------------------------------------------------------------------
*/
// ✅ serve /uploads/* as static files from backend/uploads
// Put BEFORE csurf so CSRF never blocks file viewing
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
|--------------------------------------------------------------------------
| 4) Trust proxy behind Nginx/Heroku/etc.
|--------------------------------------------------------------------------
*/
app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| 5) Session store (MySQL)
|--------------------------------------------------------------------------
*/
const sessionStore = new MySQLStoreFactory({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000,
  schema: {
    tableName: "sessions",
    columnNames: { session_id: "session_id", expires: "expires", data: "data" },
  },
});

/*
|--------------------------------------------------------------------------
| 6) Session middleware
|--------------------------------------------------------------------------
*/
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "change_this_secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

/*
|--------------------------------------------------------------------------
| 7) CSRF (AFTER session, BEFORE routes)
|--------------------------------------------------------------------------
*/
// If you want CSRF on everything, keep it global.
// But it must NOT apply to static files (already handled by placing /uploads before).
const csrfProtection = csurf({ cookie: false });

// OPTIONAL: don’t require CSRF for GET/HEAD/OPTIONS (csurf already ignores those),
// but you can also exclude some endpoints if needed.
app.use((req, res, next) => {
  // Allow preflight without CSRF
  if (req.method === "OPTIONS") return next();

  // If you ever create public routes, skip CSRF here by path:
  // if (req.path.startsWith("/api/v1/auth/login")) return next();

  return csrfProtection(req, res, next);
});

/*
|--------------------------------------------------------------------------
| 8) Endpoint to fetch CSRF token
|--------------------------------------------------------------------------
*/
app.get("/api/v1/csrf", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

/*
|--------------------------------------------------------------------------
| 9) App routes (baseURL in frontend = http://localhost:5000/api/v1)
|--------------------------------------------------------------------------
*/
app.use("/api/v1", routes);

/*
|--------------------------------------------------------------------------
| 10) Error handler (CSRF included)
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error" });
});

/*
|--------------------------------------------------------------------------
| 11) Boot
|--------------------------------------------------------------------------
*/
const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
