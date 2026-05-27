// Admin Routes
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

const adminController = require('../controllers/adminController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validationMiddleware');

// Protect all routes to Admin-only
router.use(verifyToken);
router.use(authorize(['Admin']));
router.use(sanitizeInput);

// User moderation
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: GET /users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/users', adminController.getUsers);
/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: PUT /users/:userId/status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/users/:userId/status', adminController.toggleUserStatus);

// Business validation queue
/**
 * @swagger
 * /api/admin/verification-requests:
 *   get:
 *     summary: GET /verification-requests
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/verification-requests', adminController.getVerificationRequests);
/**
 * @swagger
 * /api/admin/verification-requests/{requestId}:
 *   put:
 *     summary: PUT /verification-requests/:requestId
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/verification-requests/:requestId', adminController.moderateVerificationRequest);
/**
 * @swagger
 * /api/admin/restaurants/{id}/feature:
 *   put:
 *     summary: PUT /restaurants/:id/feature
 *     tags: [Admin]
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
router.put('/restaurants/:id/feature', adminController.toggleRestaurantFeature);
/**
 * @swagger
 * /api/admin/restaurants/{id}:
 *   delete:
 *     summary: DELETE /restaurants/:id
 *     tags: [Admin]
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
router.delete('/restaurants/:id', adminController.deleteRestaurant);

// Content reporting moderation
/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: GET /reports
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/reports', adminController.getReports);
/**
 * @swagger
 * /api/admin/reports/{reportId}/resolve:
 *   put:
 *     summary: PUT /reports/:reportId/resolve
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/reports/:reportId/resolve', adminController.resolveReport);

// Supreme Reviews Moderation
/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: GET /reviews
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/reviews', adminController.getReviews);
/**
 * @swagger
 * /api/admin/reviews/{id}:
 *   delete:
 *     summary: DELETE /reviews/:id
 *     tags: [Admin]
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
router.delete('/reviews/:id', adminController.deleteReview);

// Municipality CRUD Management
/**
 * @swagger
 * /api/admin/municipalities:
 *   get:
 *     summary: GET /municipalities
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/municipalities', adminController.getMunicipalities);
/**
 * @swagger
 * /api/admin/municipalities:
 *   post:
 *     summary: POST /municipalities
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/municipalities', adminController.createMunicipality);
/**
 * @swagger
 * /api/admin/municipalities/{id}:
 *   put:
 *     summary: PUT /municipalities/:id
 *     tags: [Admin]
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
router.put('/municipalities/:id', adminController.updateMunicipality);
/**
 * @swagger
 * /api/admin/municipalities/{id}:
 *   delete:
 *     summary: DELETE /municipalities/:id
 *     tags: [Admin]
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
router.delete('/municipalities/:id', adminController.deleteMunicipality);

// Security audit logging
/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: GET /audit-logs
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
