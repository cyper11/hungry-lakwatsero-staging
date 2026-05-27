// Rate Limiting Middleware – HungryLakwatsero
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * apiLimiter
 * General-purpose limiter applied to all /api/* routes.
 * 100 requests per IP per 15-minute window (1000 in dev).
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 2000 : 100,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    message: isDev 
      ? 'Rate limit exceeded (Dev Mode). Please wait.' 
      : 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * authLimiter
 * Stricter limiter for login / register / password-reset endpoints.
 * 20 requests per IP per 15-minute window (100 in dev).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 200 : 20, // Increased threshold
  skipSuccessfulRequests: true, // Reset failed attempts / only count failures
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: isDev
      ? 'Too many failed authentication attempts (Dev Mode). Please slow down.'
      : 'Too many failed login attempts from this IP. To protect your account, please try again in 15 minutes.'
  }
});

/**
 * uploadLimiter
 * Applied to file-upload endpoints.
 * 20 requests per IP per 1-hour window (100 in dev).
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: isDev
      ? 'Upload limit reached (Dev Mode).'
      : 'Upload limit reached. Please try again after 1 hour.'
  }
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
