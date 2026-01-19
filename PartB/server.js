// ==========================
// Imports
// ==========================

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise";
import { insertQuizSubmission, getLatestQuizSubmissions, getAllPets } from "./crud.js";
import * as crud from "./crud.js";


// ==========================
// App + Paths (ES Modules)
// ==========================

// In ES Modules there is no built-in __dirname, so we create it manually
const __filename = fileURLToPath(import.meta.url);   // full path to this file (server.js)
const __dirname = path.dirname(__filename);          // folder path of this file

const app = express();
const PORT = 3000;

// ==========================
// Middleware 
// ==========================

// Lets the server read data sent from regular HTML forms
// Built-in Express middleware, replaces the old body-parser package
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

app.get("/api/quiz/latest", async (req, res) => {
  try {
    const rows = await getLatestQuizSubmissions(pool, 10);
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("Error in GET /api/quiz/latest:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.get("/api/pets", async (req, res) => {
  try {
    const rows = await getAllPets(pool);
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("Error in GET /api/pets:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.post("/api/adoptions", async (req, res) => {
  try {
    const b = req.body;

    // מינימום חובה לפי הטבלה
    if (!b?.quiz_id || !b?.pet_id || !b?.full_name || !b?.phone) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const id = await crud.addAdoptionRequest(pool, b);
    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});


app.post("/api/quiz", async (req, res) => {
  console.log("POST /api/quiz body:", req.body);
  try {
    const data = {
      full_name: req.body.full_name,
      phone: req.body.phone,
      email: req.body.email ?? null,
      living_type: req.body.living_type,
      has_kids: req.body.has_kids,
      has_other_pets: req.body.has_other_pets,

      preferred_type: req.body.preferred_type,
      age_group: req.body.age_group,
      size: req.body.size,
      preferred_gender: req.body.preferred_gender ?? "no_matter",
      preferred_personality: req.body.preferred_personality ?? "no_matter",

      notes: req.body.notes ?? null,
      answers_json: req.body.answers_json ?? null
    };

    // בדיקת חובה בסיסית לפי מה שהטבלה דורשת
    if (!data.full_name || !data.phone || !data.living_type || !data.has_kids || !data.has_other_pets) {
      return res.status(400).json({ ok: false, error: "Missing required form fields" });
    }
    if (!data.preferred_type || !data.age_group || !data.size) {
      return res.status(400).json({ ok: false, error: "Missing required matching fields" });
    }

  // Email validation (if provided)
    if (data.email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email)) {
       return res.status(400).json({ 
        ok: false, 
       error: "Invalid email format" 
      });
    }
  }

    const id = await insertQuizSubmission(pool, data);
    res.json({ ok: true, id });
  } catch (err) {
    console.error("Error in POST /api/quiz:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Contact form route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation - check required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        ok: false, 
        message: "Missing required fields" 
      });
    }

    // Email validation - ensure proper format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        ok: false, 
        message: "Invalid email format" 
      });
    }

    // Insert to database
    const sql = `
      INSERT INTO contact_messages (name, email, message)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [name, email, message]);

    res.status(201).json({ 
      ok: true, 
      id: result.insertId,
      message: "Message received successfully" 
    });

  } catch (error) {
    console.error("Error in POST /api/contact:", error);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
});


// ==========================
// Start server
// ==========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
