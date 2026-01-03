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

const routes = require("./Routes/Route");
const { initAttendanceJob } = require("./Utils/attendanceJob");
const { initWhatsApp } = require("./Utils/whatsapp");

// Initialize background jobs
initAttendanceJob();
initWhatsApp();

const isProd = process.env.NODE_ENV === "production";

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("trust proxy", 1);

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

const csrfProtection = csurf({ cookie: false });

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  const publicPaths = [
    "/api/v1/auth/login",
    "/api/v1/login",
    "/api/v1/auth/heartbeat",
    "/api/v1/news/whatsapp/"
  ];
  if (publicPaths.some(p => req.path.startsWith(p))) return next();
  return csrfProtection(req, res, next);
});

app.get("/api/v1/csrf", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/v1", routes);

const buildPath = path.join(__dirname, "../hrm/build");
app.use(express.static(buildPath));

app.get("*any", (req, res) => {
  if (req.path.startsWith("/api/v1")) return;
  res.sendFile(path.join(buildPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("HRM Build not found.");
    }
  });
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
