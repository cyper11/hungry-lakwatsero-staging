// Analytics Routes
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics management
 */

const analyticsController = require('../controllers/analyticsController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validationMiddleware');

router.use(sanitizeInput);

// Public stats for Landing page
/**
 * @swagger
 * /api/analytics/public:
 *   get:
 *     summary: GET /public
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/public', analyticsController.getPublicStats);

// Owner analytics (secured)
/**
 * @swagger
 * /api/analytics/owner:
 *   get:
 *     summary: GET /owner
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/owner', verifyToken, authorize(['Food Business Owner']), analyticsController.getOwnerStats);

// Admin analytics (secured)
/**
 * @swagger
 * /api/analytics/admin:
 *   get:
 *     summary: GET /admin
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admin', verifyToken, authorize(['Admin']), analyticsController.getAdminStats);

// Trending analytics (public/tourist)
/**
 * @swagger
 * /api/analytics/trending:
 *   get:
 *     summary: GET /trending
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/trending', analyticsController.getTrendingStats);

module.exports = router;
