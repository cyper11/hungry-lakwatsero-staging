// Review & Community Routes
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review management
 */

const reviewController = require('../controllers/reviewController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { validateReview, sanitizeInput } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { processCloudinaryUpload } = require('../middleware/cloudinaryUpload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.use(sanitizeInput);

// My Reviews
/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: GET /
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', reviewController.getReviews);
/**
 * @swagger
 * /api/reviews/mine:
 *   get:
 *     summary: GET /mine
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/mine', verifyToken, reviewController.getMyReviews);
/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: PUT /:id
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', verifyToken, reviewController.updateReview);
/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: DELETE /:id
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', verifyToken, reviewController.deleteReview);

// Secured Routes
/**
 * @swagger
 * /api/reviews/restaurant/{id}:
 *   post:
 *     summary: POST /restaurant/:id
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/restaurant/:id', verifyToken, authorize(['Tourist', 'Admin']), uploadLimiter, upload.single('photo'), processCloudinaryUpload, sanitizeInput, validateReview, reviewController.addReview);
/**
 * @swagger
 * /api/reviews/review/{reviewId}/comment:
 *   post:
 *     summary: POST /review/:reviewId/comment
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/review/:reviewId/comment', verifyToken, authorize(['Food Business Owner', 'Admin']), reviewController.addComment);
/**
 * @swagger
 * /api/reviews/{reviewId}/reply:
 *   post:
 *     summary: POST /:reviewId/reply
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/:reviewId/reply', verifyToken, authorize(['Food Business Owner', 'Admin']), reviewController.addComment);

// Favorites Management
/**
 * @swagger
 * /api/reviews/favorites/toggle:
 *   post:
 *     summary: POST /favorites/toggle
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/favorites/toggle', verifyToken, authorize(['Tourist', 'Admin']), reviewController.toggleFavorite);
/**
 * @swagger
 * /api/reviews/favorites:
 *   get:
 *     summary: GET /favorites
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/favorites', verifyToken, authorize(['Tourist', 'Admin']), reviewController.getFavorites);

// Report Flagging
/**
 * @swagger
 * /api/reviews/report:
 *   post:
 *     summary: POST /report
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/report', verifyToken, reviewController.reportContent);

module.exports = router;
