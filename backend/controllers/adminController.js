// Admin Controller
const db = require('../config/db');
const { logAction } = require('./authController');

// User Management
const getUsers = async (req, res) => {
  try {
    const list = await db.query(
      `SELECT u.id, u.role_id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.is_verified, u.created_at, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       ORDER BY u.created_at DESC`
    );
    res.json(list);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Failed to retrieve users.' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body; // boolean

    // Prevent self-deactivation
    if (Number(userId) === req.user.id) {
      return res.status(400).json({ message: 'Self-deactivation is prohibited.' });
    }

    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
    
    const action = isActive ? 'ACTIVATE_USER' : 'BAN_USER';
    await logAction(req.user.id, action, 'users', userId, { isActive }, req.ip);

    res.json({ message: `User status updated to ${isActive ? 'active' : 'suspended'}.` });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ message: 'Failed to toggle user status.' });
  }
};

// Business Verification Queue
const getVerificationRequests = async (req, res) => {
  try {
    const requests = await db.query(
      `SELECT vr.*, u.username as owner_username, u.email as owner_email,
              r.name as restaurant_name, r.address as restaurant_address, r.is_featured,
              r.cuisine_type, m.name as municipality_name
       FROM verification_requests vr
       JOIN users u ON vr.owner_id = u.id
       JOIN restaurants r ON vr.restaurant_id = r.id
       JOIN municipalities m ON r.municipality_id = m.id
       ORDER BY vr.created_at DESC`
    );
    res.json(requests);
  } catch (error) {
    console.error('getVerificationRequests error:', error);
    res.status(500).json({ message: 'Failed to retrieve verification requests.' });
  }
};

const moderateVerificationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, remarks } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid moderation status.' });
    }

    const requests = await db.query('SELECT * FROM verification_requests WHERE id = ?', [requestId]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Verification application not found.' });
    }

    const request = requests[0];
    const restaurantStatus = status === 'approved' ? 'approved' : 'rejected';

    // Begin updates
    await db.query('UPDATE verification_requests SET status = ?, remarks = ? WHERE id = ?', [status, remarks || null, requestId]);
    await db.query('UPDATE restaurants SET status = ? WHERE id = ?', [restaurantStatus, request.restaurant_id]);

    // Log moderation action
    await logAction(req.user.id, `VERIFY_RESTAURANT_${status.toUpperCase()}`, 'restaurants', request.restaurant_id, { requestId, remarks }, req.ip);

    res.json({ message: `Business verification request has been ${status}.` });
  } catch (error) {
    console.error('moderateVerification error:', error);
    res.status(500).json({ message: 'Moderation process failed.' });
  }
};

// Content Moderation (Flagged Reports)
const getReports = async (req, res) => {
  try {
    const list = await db.query(
      `SELECT r.*, u.username as reporter_username 
       FROM reports r
       JOIN users u ON r.reporter_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(list);
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ message: 'Failed to load flagged reports.' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, resolutionNotes } = req.body; // 'delete', 'dismiss'

    const reports = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const report = reports[0];

    if (action === 'delete') {
      // Delete the reported content based on type
      if (report.entity_type === 'review') {
        await db.query('DELETE FROM reviews WHERE id = ?', [report.entity_id]);
      } else if (report.entity_type === 'comment') {
        await db.query('DELETE FROM comments WHERE id = ?', [report.entity_id]);
      } else if (report.entity_type === 'restaurant') {
        await db.query('DELETE FROM restaurants WHERE id = ?', [report.entity_id]);
      }
      await db.query('UPDATE reports SET status = \'resolved\', resolution_notes = ? WHERE id = ?', [resolutionNotes || 'Content deleted by moderator.', reportId]);
    } else {
      // Dismiss
      await db.query('UPDATE reports SET status = \'dismissed\', resolution_notes = ? WHERE id = ?', [resolutionNotes || 'Report dismissed.', reportId]);
    }

    await logAction(req.user.id, 'RESOLVE_REPORT', 'reports', reportId, { action, resolutionNotes }, req.ip);

    res.json({ message: `Report has been processed and ${action === 'delete' ? 'resolved (content deleted)' : 'dismissed'}.` });
  } catch (error) {
    console.error('resolveReport error:', error);
    res.status(500).json({ message: 'Failed to process report.' });
  }
};

// Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await db.query(
      `SELECT al.*, u.username 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 200`
    );
    res.json(logs);
  } catch (error) {
    console.error('getAuditLogs error:', error);
    res.status(500).json({ message: 'Failed to load security logs.' });
  }
};

const toggleRestaurantFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    await db.query('UPDATE restaurants SET is_featured = ? WHERE id = ?', [isFeatured ? 1 : 0, id]);

    await logAction(req.user.id, isFeatured ? 'FEATURE_RESTAURANT' : 'UNFEATURE_RESTAURANT', 'restaurants', id, { isFeatured }, req.ip);

    res.json({ message: `Restaurant featured status updated to ${isFeatured ? 'featured' : 'standard'}.` });
  } catch (error) {
    console.error('toggleRestaurantFeature error:', error);
    res.status(500).json({ message: 'Failed to toggle featured status.' });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM restaurants WHERE id = ?', [id]);
    await logAction(req.user.id, 'DELETE_RESTAURANT', 'restaurants', id, {}, req.ip);
    res.json({ message: 'Restaurant listing deleted successfully.' });
  } catch (error) {
    console.error('deleteRestaurant error:', error);
    res.status(500).json({ message: 'Failed to delete restaurant.' });
  }
};

// Reviews Management
const getReviews = async (req, res) => {
  try {
    const list = await db.query(
      `SELECT r.id, r.content, r.rating_value, r.created_at, r.image_url, 
              u.username, u.email, u.first_name, u.last_name,
              rest.name as restaurant_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN restaurants rest ON r.restaurant_id = rest.id
       ORDER BY r.created_at DESC`
    );
    res.json(list);
  } catch (error) {
    console.error('getReviews error:', error);
    res.status(500).json({ message: 'Failed to retrieve reviews.' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    await logAction(req.user.id, 'DELETE_REVIEW', 'reviews', id, {}, req.ip);
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ message: 'Failed to delete review.' });
  }
};

// Municipalities Management
const getMunicipalities = async (req, res) => {
  try {
    const list = await db.query(
      `SELECT m.*, 
              (SELECT COUNT(*) FROM restaurants r WHERE r.municipality_id = m.id) as restaurant_count 
       FROM municipalities m 
       ORDER BY m.name ASC`
    );
    res.json(list);
  } catch (error) {
    console.error('getMunicipalities error:', error);
    res.status(500).json({ message: 'Failed to retrieve municipalities.' });
  }
};

const createMunicipality = async (req, res) => {
  try {
    const { name, description, latitude, longitude } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required.' });
    }
    const result = await db.query(
      'INSERT INTO municipalities (name, description, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, description || '', Number(latitude), Number(longitude)]
    );
    await logAction(req.user.id, 'CREATE_MUNICIPALITY', 'municipalities', result.insertId, { name }, req.ip);
    res.status(201).json({ message: 'Municipality created successfully!', id: result.insertId });
  } catch (error) {
    console.error('createMunicipality error:', error);
    res.status(500).json({ message: 'Failed to create municipality.' });
  }
};

const updateMunicipality = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, latitude, longitude } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required.' });
    }
    await db.query(
      'UPDATE municipalities SET name = ?, description = ?, latitude = ?, longitude = ? WHERE id = ?',
      [name, description || '', Number(latitude), Number(longitude), id]
    );
    await logAction(req.user.id, 'UPDATE_MUNICIPALITY', 'municipalities', id, { name }, req.ip);
    res.json({ message: 'Municipality updated successfully.' });
  } catch (error) {
    console.error('updateMunicipality error:', error);
    res.status(500).json({ message: 'Failed to update municipality.' });
  }
};

const deleteMunicipality = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await db.query('SELECT id FROM restaurants WHERE municipality_id = ? LIMIT 1', [id]);
    if (check.length > 0) {
      return res.status(400).json({ message: 'Cannot delete municipality. It is referenced by one or more restaurants.' });
    }
    await db.query('DELETE FROM municipalities WHERE id = ?', [id]);
    await logAction(req.user.id, 'DELETE_MUNICIPALITY', 'municipalities', id, {}, req.ip);
    res.json({ message: 'Municipality deleted successfully.' });
  } catch (error) {
    console.error('deleteMunicipality error:', error);
    res.status(500).json({ message: 'Failed to delete municipality.' });
  }
};

module.exports = {
  getUsers,
  toggleUserStatus,
  getVerificationRequests,
  moderateVerificationRequest,
  getReports,
  resolveReport,
  getAuditLogs,
  toggleRestaurantFeature,
  deleteRestaurant,
  getReviews,
  deleteReview,
  getMunicipalities,
  createMunicipality,
  updateMunicipality,
  deleteMunicipality
};
