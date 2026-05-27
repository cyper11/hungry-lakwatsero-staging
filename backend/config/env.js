const crypto = require('crypto');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const isDev = NODE_ENV === 'development' || NODE_ENV === 'test';

const missing = [];

// --- Dev-only documented fallback secrets ---
// These EXACT values are documented in .env.example so developers
// know what they are. They are NEVER used in production.
const DEV_JWT_SECRET = 'dev_jwt_secret_replace_in_production';
const DEV_JWT_REFRESH_SECRET = 'dev_jwt_refresh_secret_replace_in_production';

let JWT_SECRET = process.env.JWT_SECRET;
let JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  if (isProd) {
    missing.push('JWT_SECRET');
  } else {
    JWT_SECRET = DEV_JWT_SECRET;
    console.warn('[env] WARNING: JWT_SECRET not set — using documented DEV fallback. DO NOT use in production.');
  }
}

if (!JWT_REFRESH_SECRET) {
  if (isProd) {
    missing.push('JWT_REFRESH_SECRET');
  } else {
    JWT_REFRESH_SECRET = DEV_JWT_REFRESH_SECRET;
    console.warn('[env] WARNING: JWT_REFRESH_SECRET not set — using documented DEV fallback. DO NOT use in production.');
  }
}

// --- CORS ---
let CORS_ORIGIN = process.env.CORS_ORIGIN;

if (!CORS_ORIGIN) {
  if (isProd) {
    missing.push('CORS_ORIGIN');
  } else {
    CORS_ORIGIN = '*';
    console.warn('[env] WARNING: CORS_ORIGIN not set — defaulting to wildcard (*) for development.');
  }
}

if (CORS_ORIGIN && CORS_ORIGIN !== '*') {
  CORS_ORIGIN = CORS_ORIGIN.split(',').map(o => o.trim());
}

// --- Database ---
const DB_HOST = process.env.DB_HOST || null;
const DB_USER = process.env.DB_USER || null;
const DB_PASSWORD = process.env.DB_PASSWORD || null;
const DB_NAME = process.env.DB_NAME || null;

// --- Uploads ---
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || '';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || null;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || null;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || null;

// --- Server URL (for Swagger docs etc.) ---
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// --- Fail loudly in production if critical secrets are missing ---
if (missing.length > 0) {
  console.error(`[env] CRITICAL: Missing required environment variables in production: ${missing.join(', ')}`);
  console.error('[env] Server will not start. Set these in your deployment platform (Render/Railway).');
  process.exit(1);
}

// --- Startup summary ---
console.log(`[env] Environment: ${NODE_ENV}`);
console.log(`[env] Auth: JWT_SECRET ${JWT_SECRET ? 'configured' : 'MISSING'}, JWT_REFRESH_SECRET ${JWT_REFRESH_SECRET ? 'configured' : 'MISSING'}`);
console.log(`[env] CORS: ${Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN.join(', ') : CORS_ORIGIN}`);
console.log(`[env] Database: ${DB_HOST ? `MySQL @ ${DB_HOST}/${DB_NAME}` : 'SQLite (dev fallback)'}`);
console.log(`[env] Uploads: ${UPLOAD_BASE_URL || 'relative paths (same-origin)'}, Cloudinary: ${CLOUDINARY_CLOUD_NAME ? 'configured' : 'not set (disk storage)'}`);
console.log(`[env] API URL: ${API_BASE_URL}`);

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV,
  isProd,
  isDev,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  CORS_ORIGIN,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  UPLOAD_BASE_URL,
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
};
