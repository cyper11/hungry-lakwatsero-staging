// HungryLakwatsero Database Adapter
// Connects to MySQL with automatic fallback to SQLite for local development.

const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let dbType = 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

// Helper to check if MySQL is configured and reachable
async function initDb() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (host && user && database) {
    try {
      console.log('Attempting to connect to MySQL...');
      mysqlPool = mysql.createPool({
        host,
        user,
        password,
        database,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test connection
      const connection = await mysqlPool.getConnection();
      console.log('Successfully connected to MySQL database:', database);
      connection.release();
      dbType = 'mysql';

      // Auto-create tables if they don't exist (idempotent — uses IF NOT EXISTS)
      await runMySQLSchema();
      // Auto-seed if tables are empty (idempotent — uses ON DUPLICATE KEY UPDATE)
      await seedMySQLIfEmpty();
      return;
    } catch (err) {
      console.warn('Failed to connect to MySQL. Falling back to local SQLite database...', err.message);
    }
  } else {
    console.log('MySQL not configured in .env. Using local SQLite database...');
  }

  // In production, do not silently fall back to SQLite
  if (process.env.NODE_ENV === 'production' && dbType !== 'mysql') {
    console.error('[db] CRITICAL: MySQL connection required in production. SQLite fallback is disabled in production.');
    console.error('[db] Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME to connect to your MySQL database.');
    process.exit(1);
  }

  // Fallback to SQLite
  dbType = 'sqlite';
  const dbPath = path.join(__dirname, '..', 'database', 'eaty_wonders.sqlite');
  
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const isNew = !fs.existsSync(dbPath);
  
  sqliteDb = new sqlite3.Database(dbPath);
  console.log(`Connected to local SQLite database at: ${dbPath}`);

  if (isNew) {
    console.log('Initializing SQLite database schema and seed data...');
    try {
      await initializeSQLiteSchema(dbPath);
    } catch (err) {
      console.error('Error initializing SQLite database:', err);
    }
  }

  // Always run posts migration (idempotent — safe to run on every startup)
  await runPostsMigration();
  await runSQLiteCompatibilityMigrations();
}

// Posts tables migration (runs on every startup — safe if tables exist)
async function runPostsMigration() {
  const migrations = [
    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      caption TEXT,
      post_type TEXT DEFAULT 'update',
      image_url TEXT,
      hashtags TEXT DEFAULT '[]',
      lat REAL,
      lng REAL,
      location_label TEXT,
      audience TEXT DEFAULT 'public',
      status TEXT DEFAULT 'published',
      pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of migrations) {
    await new Promise((resolve) => {
      sqliteDb.run(sql, (err) => {
        if (err) console.warn('Migration warning:', err.message);
        resolve();
      });
    });
  }
  console.log('Posts tables migration complete.');
}

async function runSQLiteCompatibilityMigrations() {
  const migrations = [
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_user_restaurant ON ratings(user_id, restaurant_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_restaurant ON favorites(user_id, restaurant_id)`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id)`,
    `CREATE INDEX IF NOT EXISTS idx_comments_review ON comments(review_id)`,
    `CREATE INDEX IF NOT EXISTS idx_posts_owner ON posts(owner_id)`
  ];

  for (const sql of migrations) {
    await new Promise((resolve) => {
      sqliteDb.run(sql, (err) => {
        if (err) console.warn('Compatibility migration warning:', err.message);
        resolve();
      });
    });
  }
  await new Promise((resolve) => {
    sqliteDb.run(
      "UPDATE users SET email = 'admin@hungrylakwatsero.ph' WHERE email = 'admin@eatywonders.ph'",
      () => resolve()
    );
  });
  console.log('SQLite compatibility migrations complete.');
}

// Translate MySQL DDL/DML into SQLite-compatible syntax
async function initializeSQLiteSchema() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  
  let schemaSql = fs.readFileSync(schemaPath, 'utf8');
  let seedSql = fs.readFileSync(seedPath, 'utf8');

  // Convert MySQL table syntax to SQLite compatible syntax
  schemaSql = schemaSql
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/ON UPDATE CURRENT_TIMESTAMP/g, '')
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/DOUBLE NOT NULL/g, 'REAL NOT NULL')
    .replace(/DECIMAL\(10, 2\) NOT NULL/g, 'REAL NOT NULL')
    .replace(/FOREIGN KEY \([^)]+\) REFERENCES [^(]+\([^)]+\) ON DELETE RESTRICT/g, '') // SQLite RESTRICT syntax adjustment
    .replace(/CHECK \(score BETWEEN 1 AND 5\)/g, 'CHECK (score >= 1 AND score <= 5)')
    .replace(/CHECK \(rating_value BETWEEN 1 AND 5\)/g, 'CHECK (rating_value >= 1 AND rating_value <= 5)')
    .replace(/UNIQUE KEY \w+ \([^)]+\)/g, '') // Remove explicit unique key indices
    .replace(/,\s*,/g, ',')                // Fix double commas like , ,
    .replace(/,\s*\)/g, '\n)')             // Fix trailing commas like , )
    .replace(/\(\s*,/g, '(');              // Fix leading commas like ( ,

  // SQLite supports multiple statements via db.exec
  await new Promise((resolve, reject) => {
    sqliteDb.exec(schemaSql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Remove single-line comments
  seedSql = seedSql.replace(/--.*$/gm, '');

  // Convert seed statements
  // SQLite doesn't support ON DUPLICATE KEY UPDATE in the same way, we can translate it to INSERT OR IGNORE
  seedSql = seedSql
    .replace(/\\'/g, "''")
    .replace(/INSERT IGNORE INTO/g, 'INSERT OR IGNORE INTO')
    .replace(/INSERT INTO/g, 'INSERT OR IGNORE INTO')
    .replace(/ON DUPLICATE KEY UPDATE[\s\S]*?;/g, ';');

  // Parse queries by semicolon
  const statements = seedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await new Promise((resolve, reject) => {
      sqliteDb.run(stmt, (err) => {
        if (err) {
          // Log seed failure to help identify problems
          console.warn('Seeding statement failed:', err.message, '\nStatement:', stmt.substring(0, 100));
          resolve();
        } else {
          resolve();
        }
      });
    });
  }
  console.log('SQLite database schema and seed data loaded successfully!');
}

// Unified query wrapper
async function query(sql, params = []) {
  if (!mysqlPool && !sqliteDb) {
    await initDb();
  }

  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  } else {
    // Convert MySQL parameterized queries (? to sqlite style if needed, ? works in both)
    return new Promise((resolve, reject) => {
      // Determine if it is a SELECT query
      const isSelect = /^(select|pragma|with)\b/i.test(sql.trim());
      
      if (isSelect) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) {
            reject(err);
          } else {
            // Mimic mysql2 insertId and affectedRows
            resolve({
              insertId: this.lastID,
              affectedRows: this.changes
            });
          }
        });
      }
    });
  }
}

// Auto-create MySQL tables on first run (idempotent — uses CREATE TABLE IF NOT EXISTS)
async function runMySQLSchema() {
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Remove single-line comments and split by semicolon
    const statements = schemaSql
      .split(';')
      .map(s => s.replace(/--.*$/gm, '').trim())
      .filter(s => s.length > 0);

    const createStatements = statements.filter(s =>
      /CREATE\s+(TABLE|INDEX|UNIQUE)/i.test(s)
    );

    if (createStatements.length === 0) {
      console.log('[db] No CREATE statements found in schema.sql');
      return;
    }

    console.log(`[db] Running ${createStatements.length} schema statements against MySQL...`);
    for (const stmt of createStatements) {
      try {
        await mysqlPool.query(stmt);
      } catch (e) {
        // Table/index already exists is fine (IF NOT EXISTS)
        if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_KEYNAME') {
          // silently skip
        } else {
          console.warn(`[db] Schema statement warning (${e.code}):`, e.message.substring(0, 100));
        }
      }
    }
    console.log('[db] MySQL schema verification complete. All tables ready.');
  } catch (err) {
    console.error('[db] Schema setup failed:', err.message);
    throw err; // Critical — don't start server with missing tables
  }
}

// Auto-seed MySQL if core tables are empty (idempotent — seed uses ON DUPLICATE KEY UPDATE)
async function seedMySQLIfEmpty() {
  try {
    const [rows] = await mysqlPool.query("SELECT COUNT(*) as count FROM roles");
    if (rows[0].count > 0) {
      console.log('[db] MySQL seed data already present, skipping auto-seed.');
      return;
    }

    console.log('[db] MySQL tables are empty. Running auto-seed from seed.sql...');
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Execute seed as individual statements
    const statements = seedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await mysqlPool.query(stmt);
      } catch (e) {
        console.warn('[db] Seed statement warning:', e.message);
      }
    }
    console.log('[db] MySQL auto-seed complete. Roles, municipalities, and demo users loaded.');
  } catch (err) {
    console.warn('[db] Auto-seed check failed:', err.message);
    // Non-fatal: server still starts, but registration may fail if seed is missing
  }
}

// Close databases gracefully
async function close() {
  if (mysqlPool) {
    await mysqlPool.end();
  }
  if (sqliteDb) {
    await new Promise((resolve) => sqliteDb.close(() => resolve()));
  }
}

module.exports = {
  query,
  initDb,
  close,
  getDbType: () => dbType
};
