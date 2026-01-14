import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// serve static files (html, css, js)
app.use(express.static(__dirname));

// MySQL connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "134679258Yuval",
  database: "PetMatch",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10
});

(async () => {
  try {
    await pool.execute("SET NAMES utf8mb4");
  } catch (e) {
    console.error("SET NAMES failed:", e);
  }
})();

// test route
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// save quiz answers
app.post("/api/quiz", async (req, res) => {
  try {
    const preferred_type = req.body.preferred_type ?? req.body.preferredType;
    const age_group = req.body.age_group ?? req.body.ageGroup;
    const size = req.body.size;
    const notes = req.body.notes ?? null;
    const answers_json = req.body.answers_json ?? req.body.answersJson ?? null;

    if (!preferred_type || !age_group || !size) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

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
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});


const PORT = 3000;
// read last submissions (debug)
app.get("/api/quiz/latest", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, preferred_type, age_group, size, notes, created_at FROM quiz_submissions ORDER BY id DESC LIMIT 10"
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
