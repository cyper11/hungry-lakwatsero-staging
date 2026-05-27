-- =============================================================
-- HungryLakwatsero: Cavite Culinary Tourism Platform
-- Database Schema — MySQL (production) / SQLite (dev fallback)
-- All tables follow 3NF. Compatible with db.js dual-driver.
-- =============================================================

-- ------------------------------------------------------------
-- 1. roles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

-- ------------------------------------------------------------
-- 2. users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NULL,
  middle_name VARCHAR(50) NULL,
  last_name VARCHAR(50) NULL,
  suffix VARCHAR(20) NULL,                  -- Jr., Sr., III, etc.
  phone_number VARCHAR(20) NULL,
  avatar_url VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- 3. municipalities
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS municipalities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  featured_image VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 4. restaurants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  municipality_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  address VARCHAR(255) NOT NULL,
  barangay VARCHAR(100) NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  contact_info VARCHAR(100) NULL,
  business_hours TEXT NULL,               -- JSON string: {"Monday": "9AM-9PM", ...}
  history_story TEXT NULL,                -- Heritage and culinary background
  cuisine_type VARCHAR(100) NULL,         -- Primary cuisine category
  cuisine_tags TEXT NULL,                 -- Comma-separated tags: "Filipino,Seafood,Heritage"
  business_reg_date DATE NULL,            -- Date of business registration / permit
  is_featured BOOLEAN DEFAULT FALSE,      -- Highlighted on home / explore pages
  status VARCHAR(20) DEFAULT 'pending',   -- pending | approved | rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- 5. restaurant_images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 6. menu_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,          -- Appetizer, Main Course, Dessert, Beverage, etc.
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 7. ratings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_restaurant_rating (user_id, restaurant_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 8. reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 9. comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 10. favorites
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_fav (user_id, restaurant_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 11. reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,       -- review | comment | restaurant | story
  entity_id INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',   -- pending | resolved | dismissed
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 12. announcements
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 13. food_stories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  municipality_id INT NOT NULL,
  traditional_dishes TEXT NULL,           -- Comma-separated list of featured dishes
  image_url VARCHAR(255) NULL,
  status VARCHAR(20) DEFAULT 'draft',     -- draft | published
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 14. verification_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  document_url VARCHAR(255) NOT NULL,                -- Legacy: main document upload
  dti_url VARCHAR(255) NULL,                         -- DTI Certificate of Registration
  barangay_clearance_url VARCHAR(255) NULL,          -- Barangay Business Clearance
  owner_id_url VARCHAR(255) NULL,                    -- Government-issued ID of owner
  business_permit_url VARCHAR(255) NULL,             -- Mayor's / Municipal Business Permit
  restaurant_photos TEXT NULL,                       -- JSON array of photo URLs
  status VARCHAR(20) DEFAULT 'pending',              -- pending | approved | rejected
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 15. audit_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id INT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 16. sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 17. password_reset_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 18. email_verification_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 19. hidden_gems
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hidden_gems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  suggester_id INT NULL,                              -- NULL = anonymous suggestion
  restaurant_name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  municipality_id INT NOT NULL,
  description TEXT NULL,
  suggested_by_type VARCHAR(20) DEFAULT 'tourist',   -- tourist | local | owner
  status VARCHAR(20) DEFAULT 'pending',              -- pending | approved | rejected | featured
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (suggester_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- 20. posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  owner_id INT NOT NULL,
  caption TEXT NULL,
  post_type VARCHAR(50) DEFAULT 'update',
  image_url VARCHAR(255) NULL,
  hashtags TEXT NULL,                     -- Stores JSON string of tags
  lat DOUBLE NULL,
  lng DOUBLE NULL,
  location_label VARCHAR(255) NULL,
  audience VARCHAR(50) DEFAULT 'public',
  status VARCHAR(255) DEFAULT 'published',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 21. post_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_post_user_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 22. post_comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
