// ==========================
// Imports
// ==========================

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise";

// ==========================
// App + Paths (ES Modules)
// ==========================

// In ES Modules there is no built-in __dirname, so we create it manually
const __filename = fileURLToPath(import.meta.url);   // full path to this file (server.js)
const __dirname = path.dirname(__filename);          // folder path of this file

const app = express();
const PORT = 3000;

// ==========================
// Middleware (request parsing)
// ==========================

// Lets the server read data sent from regular HTML forms
app.use(express.urlencoded({ extended: true }));

// Lets the server read JSON data
app.use(express.json());

// ==========================
// Static files (frontend)
// ==========================

// Serves files from /public so the browser can access HTML, CSS, JS and images
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// Database (MySQL connection pool)
// ==========================

// Pool = reusable connections, better performance than opening a new connection each request
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "134679258Yuval",
  database: "PetMatch",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10
});

// Optional: ensure the connection uses utf8mb4 for Hebrew/emoji support
(async () => {
  try {
    await pool.execute("SET NAMES utf8mb4");
  } catch (e) {
    console.error("SET NAMES failed:", e);
  }
})();

// ==========================
// Routes
// ==========================

// Health check route, quick way to see the server is alive
// http://localhost:3000/health
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// Save quiz answers into the database
// This endpoint expects a JSON body with required fields:
// preferred_type, age_group, size
// POST http://localhost:3000/api/quiz
app.post("/api/quiz", async (req, res) => {
  console.log("POST /api/quiz body:", req.body);

  try {
    // Support two naming styles (snake_case / camelCase)
    const preferred_type = req.body.preferred_type ?? req.body.preferredType;
    const age_group = req.body.age_group ?? req.body.ageGroup;
    const size = req.body.size;

    // Optional fields
    const notes = req.body.notes ?? null;
    const answers_json = req.body.answers_json ?? req.body.answersJson ?? null;

    // Validate required fields
    if (!preferred_type || !age_group || !size) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Insert into DB (parameterized query prevents SQL injection)
    const sql = `
      INSERT INTO quiz_submissions
      (preferred_type, age_group, size, notes, answers_json)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      preferred_type,
      age_group,
      size,
      notes,
      answers_json ? JSON.stringify(answers_json) : null
    ];

    const [result] = await pool.execute(sql, values);

    // Return success + inserted row id
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("Error in POST /api/quiz:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Get the latest 10 quiz submissions (debug endpoint)
// Example: http://localhost:3000/api/quiz/latest
app.get("/api/quiz/latest", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, preferred_type, age_group, size, notes, created_at FROM quiz_submissions ORDER BY id DESC LIMIT 10"
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("Error in GET /api/quiz/latest:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ==========================
// Start server
// ==========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
