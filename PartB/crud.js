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

// Get all pets (for results page)
export const getAllPets = async (pool) => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM pets
     ORDER BY id DESC`
  );
  return rows;
};

export const addAdoptionRequest = async (pool, data) => {
  const {
    quiz_id,
    pet_id,
    full_name,
    phone,
    email,
    city,
    living_type,
    has_kids,
    has_other_pets,
    request_notes
  } = data;

  const sql = `
    INSERT INTO adoption_requests
    (quiz_id, pet_id, full_name, phone, email, city, living_type, has_kids, has_other_pets, request_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    quiz_id,
    pet_id,
    full_name,
    phone,
    email || null,
    city || null,
    living_type || null,
    has_kids || null,
    has_other_pets || null,
    request_notes || null
  ];

  const [result] = await pool.execute(sql, values);
  return result.insertId;
};




