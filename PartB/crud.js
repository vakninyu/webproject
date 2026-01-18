// crud.js
// Database operations for the project (quiz, adoption, pets, etc.)

export const insertQuizSubmission = async (pool, data) => {
  const {
    full_name,
    phone,
    email,
    living_type,
    has_kids,
    has_other_pets,

    preferred_type,
    age_group,
    size,
    preferred_gender,
    preferred_personality,

    notes,
    answers_json
  } = data;

  const sql = `
    INSERT INTO quiz_submissions
    (
      full_name,
      phone,
      email,
      living_type,
      has_kids,
      has_other_pets,
      preferred_type,
      age_group,
      size,
      preferred_gender,
      preferred_personality,
      notes,
      answers_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    full_name,
    phone,
    email,
    living_type,
    has_kids,
    has_other_pets,
    preferred_type,
    age_group,
    size,
    preferred_gender,
    preferred_personality,
    notes,
    answers_json ? JSON.stringify(answers_json) : null
  ];

  const [result] = await pool.execute(sql, values);
  return result.insertId;
};

// Get latest quiz submissions (for debug / admin page)
export const getLatestQuizSubmissions = async (pool, limit = 10) => {
  const n = parseInt(limit, 10);
  const safeLimit = Number.isFinite(n) && n > 0 && n <= 100 ? n : 10;

  const [rows] = await pool.execute(
    `SELECT id, full_name, phone, email, living_type, has_kids, has_other_pets,
            preferred_type, age_group, size, preferred_gender, preferred_personality,
            notes, created_at
     FROM quiz_submissions
     ORDER BY id DESC
     LIMIT ${safeLimit}`
  );

  return rows;
};




