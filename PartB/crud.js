// crud.js
// Database operations for the project (quiz, adoption, pets, etc.)


// Insert a new quiz submission into the database
// This function receives the quiz data from the client
// and saves it in the quiz_submissions table.
// It returns the ID of the newly created quiz record.
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


// Get the latest quiz submissions from the database
// Used mainly for debugging or an admin-style view
// The limit parameter controls how many records are returned
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

// Get all pets from the database 
// This data is used to display the matching pets on the results page
export const getAllPets = async (pool) => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM pets
     ORDER BY id DESC`
  );
  return rows;
};

// Insert a new adoption request into the database
// This function connects a quiz submission with a specific pet
// and saves the user's adoption details
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

// Get latest adoption requests (for admin / debug view)
export const getLatestAdoptionRequests = async (pool, limit = 10) => {
  const n = parseInt(limit, 10);
  const safeLimit = Number.isFinite(n) && n > 0 && n <= 100 ? n : 10;

  const [rows] = await pool.execute(
    `SELECT *
     FROM adoption_requests
     ORDER BY id DESC
     LIMIT ${safeLimit}`
  );

  return rows;
};





