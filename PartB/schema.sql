-- =========================================
-- PetMatch DB Schema 
-- =========================================

-- CREATE DATABASE IF NOT EXISTS petmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- USE petmatch;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS adoption_requests;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS quiz_submissions;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- 1) quiz_submissions
-- =========================================
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120) DEFAULT NULL,

  living_type ENUM('apartment','house') NOT NULL,
  has_kids ENUM('yes','no') NOT NULL,
  has_other_pets ENUM('yes','no') NOT NULL,

  preferred_type ENUM('dog','cat','rabbit','other','no_matter') NOT NULL,
  age_group ENUM('puppy','young','adult','senior','no_matter') NOT NULL,
  size ENUM('small','medium','large','no_matter') NOT NULL,

  preferred_gender ENUM('male','female','no_matter') NOT NULL DEFAULT 'no_matter',
  preferred_personality ENUM('calm','friendly','kids','playful','no_matter') NOT NULL DEFAULT 'no_matter',

  notes VARCHAR(255) DEFAULT NULL,
  answers_json JSON DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =========================================
-- 2) pets
-- =========================================
CREATE TABLE IF NOT EXISTS pets (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  type ENUM('dog','cat','rabbit','other') NOT NULL,
  gender ENUM('male','female') NOT NULL,
  age_group ENUM('puppy','young','adult','senior') NOT NULL,
  size ENUM('small','medium','large') NOT NULL,

  kids_friendly ENUM('yes','no') NOT NULL,
  good_with_pets ENUM('yes','no') NOT NULL,
  needs_yard ENUM('yes','no') NOT NULL,

  friendly ENUM('yes','no') NOT NULL,
  calm ENUM('yes','no') NOT NULL,
  playful ENUM('yes','no') NOT NULL,

  city VARCHAR(80) DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =========================================
-- 3) adoption_requests
-- =========================================
CREATE TABLE IF NOT EXISTS adoption_requests (
  id INT NOT NULL AUTO_INCREMENT,

  quiz_id INT NOT NULL,
  pet_id INT NOT NULL,

  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,

  living_type ENUM('apartment','house') DEFAULT NULL,
  has_kids ENUM('yes','no') DEFAULT NULL,
  has_other_pets ENUM('yes','no') DEFAULT NULL,

  preferred_type ENUM('dog','cat','rabbit','other','no_matter') DEFAULT NULL,
  preferred_gender ENUM('male','female','no_matter') DEFAULT NULL,
  preferred_age_group ENUM('puppy','young','adult','senior','no_matter') DEFAULT NULL,
  preferred_size ENUM('small','medium','large','no_matter') DEFAULT NULL,

  request_notes TEXT DEFAULT NULL,

  status ENUM('pending','approved','rejected','contacted') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_adoption_quiz
    FOREIGN KEY (quiz_id) REFERENCES quiz_submissions(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_adoption_pet
    FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =========================================
-- 4) contact_messages
-- =========================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- =========================================
-- 5) Seed pets data
-- =========================================
INSERT INTO pets
(name, type, gender, age_group, size,
 kids_friendly, good_with_pets, needs_yard,
 friendly, calm, playful,
 city, image, description)
VALUES
('לונה', 'dog', 'female', 'puppy', 'small',
 'yes', 'yes', 'no',
 'yes', 'no', 'yes',
 'תל אביב', 'images/Animals/Luna.jpg', 'כלבה קטנה, אוהבת לשחק ומסתדרת מצויין עם ילדים.'),

('מקס', 'dog', 'male', 'adult', 'large',
 'yes', 'yes', 'yes',
 'yes', 'no', 'yes',
 'רמת גן', 'images/Animals/Max.jpg', 'כלב אנרגטי שאוהב ריצות וטיולים ארוכים. פחות מסתדר עם חיות קטנות.'),

('מיצה', 'cat', 'female', 'adult', 'medium',
 'yes', 'yes', 'no',
 'no', 'yes', 'no',
 'חולון', 'images/Animals/Mitza.webp', 'חתולה שקטה ועצמאית, אוהבת פינות שקטות בבית.'),

('ג׳ורג׳', 'rabbit', 'male', 'young', 'small',
 'yes', 'yes', 'no',
 'yes', 'no', 'yes',
 'עמק חפר', 'images/Animals/George.jpg', 'ארנב צעיר ושובב, אוהב להתרוצץ ולחקור. חברותי, מסתדר עם ילדים וחיות נוספות, ומתאים לבית פעיל.'),

('טומי', 'cat', 'male', 'young', 'small',
 'yes', 'yes', 'yes',
 'yes', 'no', 'yes',
 'ראשון לציון', 'images/Animals/Tomi1.jpg', 'חתול חברותי, מסתדר עם ילדים ואוהב לקבל ליטופים. מומלץ חצר כי הוא אנרגטי ורץ בכל מקום.'),

('בוני', 'dog', 'female', 'senior', 'small',
 'yes', 'yes', 'no',
 'no', 'yes', 'no',
 'פתח תקווה', 'images/Animals/Boni.jpg', 'כלבה שקטה וחכמה, אוהבת לנוח, להתרכבל ולקבל ליטופים. מתאימה לבית רגוע.'),

('רוקי', 'dog', 'male', 'senior', 'large',
 'yes', 'yes', 'yes',
 'yes', 'yes', 'no',
 'חיפה', 'images/Animals/Rocki.jpg', 'כלב גדול ועדין, מאוד אוהב ילדים וטיולים רגועים. החלים ממחלה וכעת מחפש בית חם.'),

('נאלה', 'cat', 'female', 'adult', 'medium',
 'yes', 'no', 'no',
 'yes', 'yes', 'yes',
 'ירושלים', 'images/Animals/Nalla.jpeg', 'חתולה מתוקה ובוגרת עם אופי עדין. קצת חוששת מכלבים ולכן מחפשת בית שקט.'),

('ליאו', 'cat', 'male', 'adult', 'medium',
 'no', 'yes', 'no',
 'no', 'yes', 'no',
 'עפולה', 'images/Animals/Leo.jpg', 'חתול עצמאי, עבר חיים לא קלים וכעת מחפש בית שקט. אוהב ליטופים במינון.'),

('סאני', 'dog', 'female', 'puppy', 'small',
 'yes', 'no', 'yes',
 'yes', 'no', 'yes',
 'רמת גן', 'images/Animals/Sunny.jpg', 'גורה מתוקה ומלאת אנרגיה, צריכה הרבה תשומת לב ופריקת אנרגיה. מחפשת בית חם.'),

('מוקה', 'cat', 'female', 'adult', 'large',
 'yes', 'yes', 'no',
 'yes', 'yes', 'yes',
 'חולון', 'images/Animals/Moka.jpeg', 'חתולה עדינה ומאוד אנושית, מסתדרת עם ילדים וכלבים, שילוב של שובבות ורוגע.'),

('ברונו', 'dog', 'male', 'adult', 'medium',
 'yes', 'yes', 'no',
 'yes', 'yes', 'no',
 'אשדוד', 'images/Animals/Bruno.jpg', 'כלב רגוע ונוח, מתוק עם מבט שממיס לבבות. מתאים למשפחה או לזוג.'),

('פופי', 'cat', 'female', 'senior', 'medium',
 'no', 'no', 'no',
 'no', 'yes', 'no',
 'באר שבע', 'images/Animals/Popi.png', 'חתולה מבוגרת ומתוקה, אוהבת שקט וחיבוקים.'),

('שלג', 'rabbit', 'male', 'young', 'medium',
 'yes', 'no', 'no',
 'yes', 'yes', 'no',
 'דירה / בית', 'images/Animals/Sheleg.jpg', 'ארנב עדין עם פציעה קלה ברגל. מעט חושש מחיות אחרות ולכן מומלץ לבית שקט.'),

('קוקי', 'rabbit', 'female', 'adult', 'small',
 'yes', 'yes', 'no',
 'yes', 'no', 'yes',
 'הרצליה', 'images/Animals/Cookie.jpg', 'ארנבת שובבה וחמודה, מתחברת לילדים במהירות.'),

('ציקו', 'other', 'male', 'young', 'small',
 'yes', 'yes', 'no',
 'yes', 'no', 'yes',
 'תל אביב', 'images/Animals/Chiko.jpg', 'תוכי חכם וסקרן, מלא אופי ושמחת חיים. נהנה מתקשורת ותשומת לב.'),

('נשנש', 'other', 'male', 'adult', 'small',
 'yes', 'no', 'no',
 'yes', 'no', 'yes',
 'קריית טבעון', 'images/Animals/Nashnash.jpg', 'אוגר מתוק וסקרן. מתאים יותר למשפחות עם ילדים גדולים ואחראיים.'),

('לולי', 'other', 'female', 'young', 'medium',
 'yes', 'yes', 'no',
 'yes', 'no', 'yes',
 'מזכרת בתיה', 'images/Animals/Luli.jpeg', 'שרקנית מתוקה וחברותית, אוהבת ליטופים ופינוקים. גזר זו הדרך ללב שלה .');

--Check tables and data:
SHOW TABLES;
SELECT COUNT(*) AS pets_count FROM pets;
DESCRIBE quiz_submissions;
DESCRIBE adoption_requests;
DESCRIBE contact_messages;
