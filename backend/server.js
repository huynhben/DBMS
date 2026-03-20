const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── DB Connection ────────────────────────────────────────────────
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // your MySQL username
  password: "newpassword123$", // your MySQL password
  database: "P4DB",
});

db.connect((err) => {
  if (err) {
    console.error(" MySQL connection failed:", err.message);
  } else {
    console.log(" Connected to MySQL — P4DB");
  }
});

// ── Routes ───────────────────────────────────────────────────────

// Health check / connection status
app.get("/api/status", (req, res) => {
  db.ping((err) => {
    if (err)
      return res.status(500).json({ connected: false, error: err.message });
    res.json({ connected: true, database: "P4DB", host: "localhost" });
  });
});

// Get all users
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM `User`", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all courses
app.get("/api/courses", (req, res) => {
  db.query("SELECT * FROM Course", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all assignments
app.get("/api/assignments", (req, res) => {
  db.query("SELECT * FROM Assignment", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all enrollments (joined with user + course names)
app.get("/api/enrollments", (req, res) => {
  const sql = `
    SELECT e.enrollmentID, u.name AS userName, c.courseName, e.enrollmentDate, e.status
    FROM Enrollment e
    JOIN \`User\` u ON e.userID = u.userID
    JOIN Course c ON e.courseID = c.courseID
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Row count summary for all tables
app.get("/api/summary", (req, res) => {
  const tables = [
    "User",
    "Course",
    "CourseDay",
    "Enrollment",
    "Assignment",
    "TimeLog",
    "Notification",
    "Organization",
    "OrganizationMembership",
    "Event",
    "EventDay",
  ];
  const queries = tables.map(
    (t) =>
      new Promise((resolve, reject) => {
        const name = t === "User" ? "`User`" : t;
        db.query(`SELECT COUNT(*) AS count FROM ${name}`, (err, rows) => {
          if (err) reject(err);
          else resolve({ table: t, rows: rows[0].count });
        });
      }),
  );
  Promise.all(queries)
    .then((results) => res.json(results))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Insert a new user
app.post("/api/users", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ error: "name, email, and password are required." });
  db.query(
    "INSERT INTO `User` (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, insertedID: result.insertId });
    },
  );
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = 5001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
