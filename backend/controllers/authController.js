// Authentication Controller
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, roleId: user.role_id },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Log audit actions helper
const logAction = async (userId, action, entityType, entityId, details, ip = '127.0.0.1') => {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, JSON.stringify(details), ip]
    );
  } catch (err) {
    console.error('Audit logger failed:', err);
  }
};

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      suffix,
      phoneNumber,
      roleId,
      captchaAnswer,
      captchaInput,
      restaurantName,
      restaurantAddress,
      barangay,
      municipalityId,
      businessRegDate,
      description,
      cuisineType,
      operatingHours,
      contactNumber
    } = req.body;

    if (captchaInput && captchaAnswer && String(captchaInput) !== String(captchaAnswer)) {
      return res.status(400).json({ message: 'Invalid CAPTCHA code. Please try again.' });
    }

    const baseUsername = (username || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 30) || `user${Date.now()}`;
    let finalUsername = baseUsername;
    let suffixCounter = 1;
    while ((await db.query('SELECT id FROM users WHERE username = ?', [finalUsername])).length > 0) {
      finalUsername = `${baseUsername}${suffixCounter++}`.slice(0, 50);
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email address already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const files = req.files || {};
    const avatarUrl = files.profilePhoto?.[0] ? `/uploads/${files.profilePhoto[0].filename}` : null;

    // Create user
    const result = await db.query(
      `INSERT INTO users
        (role_id, username, email, password_hash, first_name, middle_name, last_name, suffix, phone_number, avatar_url, is_active, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
      [
        Number(roleId),
        finalUsername,
        email,
        passwordHash,
        firstName || null,
        middleName || null,
        lastName || null,
        suffix || null,
        phoneNumber || null,
        avatarUrl
      ]
    );
    const userId = result.insertId;

    let restaurantId = null;
    if (Number(roleId) === 2 && restaurantName && restaurantAddress && municipalityId) {
      const municipalities = await db.query('SELECT latitude, longitude FROM municipalities WHERE id = ?', [municipalityId]);
      const municipality = municipalities[0] || { latitude: 14.2456, longitude: 120.8787 };

      const restaurantResult = await db.query(
        `INSERT INTO restaurants
          (owner_id, municipality_id, name, description, address, barangay, latitude, longitude,
           contact_info, business_hours, cuisine_type, business_reg_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          userId,
          municipalityId,
          restaurantName,
          description || null,
          restaurantAddress,
          barangay || null,
          Number(municipality.latitude),
          Number(municipality.longitude),
          contactNumber || phoneNumber || null,
          operatingHours || null,
          cuisineType || null,
          businessRegDate || null
        ]
      );
      restaurantId = restaurantResult.insertId;

      const dtiUrl = files.dtiDoc?.[0] ? `/uploads/${files.dtiDoc[0].filename}` : null;
      const barangayUrl = files.brgyDoc?.[0] ? `/uploads/${files.brgyDoc[0].filename}` : null;
      const ownerIdUrl = files.ownerIdDoc?.[0] ? `/uploads/${files.ownerIdDoc[0].filename}` : null;
      const businessPermitUrl = files.businessPermit?.[0] ? `/uploads/${files.businessPermit[0].filename}` : null;
      const documentUrl = businessPermitUrl || dtiUrl || barangayUrl || ownerIdUrl;

      if (documentUrl) {
        await db.query(
          `INSERT INTO verification_requests
            (owner_id, restaurant_id, document_url, dti_url, barangay_clearance_url, owner_id_url, business_permit_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [userId, restaurantId, documentUrl, dtiUrl, barangayUrl, ownerIdUrl, businessPermitUrl]
        );
      }
    }

    // Create email verification token
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Convert date to MySQL format
    const mysqlExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, verificationToken, mysqlExpiresAt]
    );

    // Audit log
    await logAction(userId, 'REGISTER', 'users', userId, { email, roleId, restaurantId }, req.ip);

    res.status(201).json({
      message: 'Registration successful! An email verification code has been sent.',
      userId,
      username: finalUsername,
      restaurantId,
      ...(env.isDev && { verificationToken })
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server registration error. Please try again later.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, captchaInput, captchaAnswer } = req.body;

    if (captchaInput && captchaAnswer && captchaInput !== captchaAnswer) {
      return res.status(400).json({ message: 'Invalid CAPTCHA code.' });
    }

    // Fetch user and role details
    const users = await db.query(
      'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? OR u.username = ?',
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to session table
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const mysqlExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    await db.query('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, mysqlExpiresAt]);

    // Audit log
    await logAction(user.id, 'LOGIN', 'users', user.id, { username: user.username }, req.ip);

    res.json({
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        role: user.role_name,
        roleId: user.role_id,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server login error.' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const tokens = await db.query('SELECT * FROM email_verification_tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP', [token]);
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Verification code is invalid or has expired.' });
    }

    const verification = tokens[0];
    await db.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [verification.user_id]);
    await db.query('DELETE FROM email_verification_tokens WHERE id = ?', [verification.id]);

    await logAction(verification.user_id, 'VERIFY_EMAIL', 'users', verification.user_id, {}, req.ip);

    res.json({ message: 'Email verified successfully! You can now access full features.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed.' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    // Verify in database
    const sessions = await db.query('SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP', [refreshToken]);
    if (sessions.length === 0) {
      return res.status(401).json({ message: 'Refresh token is invalid or expired. Please sign in again.' });
    }

    const session = sessions[0];

    // Decode token
    jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token verification failed. Please sign in again.' });
      }

      // Fetch user details
      const users = await db.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?', [decoded.id]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'User not found.' });
      }

      const user = users[0];
      const newTokens = generateTokens(user);

      // Refresh database session token
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const mysqlExpiresAt = newExpiresAt.toISOString().slice(0, 19).replace('T', ' ');
      await db.query('UPDATE sessions SET token = ?, expires_at = ? WHERE id = ?', [newTokens.refreshToken, mysqlExpiresAt, session.id]);

      res.json({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        newRefreshToken: newTokens.refreshToken
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Token refresh failed.' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.query('DELETE FROM sessions WHERE token = ?', [refreshToken]);
    }
    
    if (req.user) {
      await logAction(req.user.id, 'LOGOUT', 'users', req.user.id, {}, req.ip);
    }

    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account matches that email address.' });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    const mysqlExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    await db.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, resetToken, mysqlExpiresAt]);
    await logAction(user.id, 'FORGOT_PASSWORD', 'users', user.id, { email }, req.ip);

    res.json({
      message: 'Reset token generated successfully.',
      ...(env.isDev && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Recovery failed.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const tokens = await db.query('SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP', [token]);
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired.' });
    }

    const reset = tokens[0];
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, reset.user_id]);
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [reset.user_id]);

    await logAction(reset.user_id, 'RESET_PASSWORD', 'users', reset.user_id, {}, req.ip);

    res.json({ message: 'Password has been updated. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Reset password failed.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const userId = req.user.id;

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, phoneNumber, userId]
    );

    // Fetch updated user
    const users = await db.query(
      'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        role: user.role_name,
        roleId: user.role_id,
        isVerified: user.is_verified,
        phoneNumber: user.phone_number
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const users = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, userId]);

    await logAction(userId, 'CHANGE_PASSWORD', 'users', userId, {}, req.ip);

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // First delete sessions and other dependent data if necessary
    await db.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
    // Set user as inactive instead of hard deleting to preserve audit logs and foreign keys
    await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [userId]);

    await logAction(userId, 'DELETE_ACCOUNT', 'users', userId, {}, req.ip);

    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account.' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
  logAction
};
