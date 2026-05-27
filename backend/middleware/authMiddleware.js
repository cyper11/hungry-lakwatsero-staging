// Authentication and Role-Based Access Control (RBAC) Middlewares
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');

// Numeric role ID → name mapping
const ROLE_MAP = {
  1: 'tourist',
  2: 'food_owner',
  3: 'admin'
};

// String role name → numeric ID mapping. Accepts database labels, UI labels,
// and earlier snake_case aliases used throughout the route files.
const ROLE_ID_MAP = {
  tourist: 1,
  user: 1,
  food_owner: 2,
  owner: 2,
  business_owner: 2,
  food_business_owner: 2,
  admin: 3
};

const normalizeRoleKey = (role) => String(role)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

/**
 * authMiddleware
 * Verifies the Bearer JWT, checks the user is still active in the DB,
 * and attaches { id, username, email, roleId, role } to req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        env.JWT_SECRET
      );
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired. Please refresh your session.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    // Verify user still exists and is active
    const users = await db.query(
      'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({
        message: 'Your account has been deactivated or banned by administrators.'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      role: user.role_name
    };

    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    return res.status(500).json({ message: 'Internal server authorization error.' });
  }
};

/**
 * requireRole(...roles)
 * Accepts role names ('admin', 'food_owner', 'tourist') or numeric IDs.
 * Must be used AFTER authMiddleware.
 *
 * Example: requireRole('admin')
 * Example: requireRole('admin', 'food_owner')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userRoleId = req.user.roleId;

  // Normalize each role argument to a numeric ID
  const allowedIds = roles.map(r =>
    typeof r === 'string' ? (ROLE_ID_MAP[normalizeRoleKey(r)] ?? r) : r
  );

  if (!allowedIds.includes(userRoleId)) {
    return res.status(403).json({
      message: `Insufficient permissions. Required role(s): [${roles.join(', ')}]. Your role: ${req.user.role}`
    });
  }

  next();
};

// Legacy alias kept so any existing code using verifyToken / authorize still works
const verifyToken = authMiddleware;
const authorize = (allowedRoles = []) => requireRole(...allowedRoles);

module.exports = { authMiddleware, requireRole, verifyToken, authorize };
