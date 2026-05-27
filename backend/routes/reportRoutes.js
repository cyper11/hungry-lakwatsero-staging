const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Report management
 */

const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validationMiddleware');

router.use(sanitizeInput);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: POST /
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', verifyToken, reviewController.reportContent);

module.exports = router;
