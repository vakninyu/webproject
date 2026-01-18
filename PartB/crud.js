// crud.js
// Database operations for the project (quiz, adoption, pets, etc.)

export const insertQuizSubmission = async (pool, data) => {
  const {
    preferred_type,
    age_group,
    size,
    notes,
    answers_json
  } = data;

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
  return result.insertId;
};

// Get latest quiz submissions (for debug / admin page)
export const getLatestQuizSubmissions = async (pool, limit = 10) => {
  const safeLimit = Number.isInteger(limit) ? limit : 10;

  const [rows] = await pool.execute(
    "SELECT id, preferred_type, age_group, size, notes, created_at FROM quiz_submissions ORDER BY id DESC LIMIT ?",
    [safeLimit]
  );

  return rows;
};

