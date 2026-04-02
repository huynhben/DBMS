const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


const db = pool.promise();

// Health check
app.get("/api/status", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ connected: true, database: process.env.DB_NAME, host: process.env.DB_HOST });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM `User`");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Course");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assignments
app.get("/api/assignments", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Assignment");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all enrollments
app.get("/api/enrollments", async (req, res) => {
  try {
    const sql = `
      SELECT e.enrollmentID, u.name AS userName, c.courseName, e.enrollmentDate, e.status
      FROM Enrollment e
      JOIN \`User\` u ON e.userID = u.userID
      JOIN Course c ON e.courseID = c.courseID
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Row count summary for all tables
app.get("/api/summary", async (req, res) => {
  const tables = [
    "User", "Course", "CourseDay", "Enrollment", "Assignment",
    "TimeLog", "Notification", "Organization",
    "OrganizationMembership", "Event", "EventDay",
  ];
  try {
    const results = await Promise.all(
      tables.map(async (t) => {
        const name = t === "User" ? "`User`" : t;
        const [rows] = await db.query(`SELECT COUNT(*) AS count FROM ${name}`);
        return { table: t, rows: rows[0].count };
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert a new user
app.post("/api/users", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email, and password are required." });
  try {
    const [result] = await db.query(
      "INSERT INTO `User` (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    res.json({ success: true, insertedID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
