// Restaurant Routes
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Restaurant management
 */

const restaurantController = require('../controllers/restaurantController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { validateRestaurant, sanitizeInput } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { processCloudinaryUpload } = require('../middleware/cloudinaryUpload');

router.use(sanitizeInput);

// Owner-specific routes MUST come before /:id to prevent shadowing
/**
 * @swagger
 * /api/restaurants/owner/me:
 *   get:
 *     summary: GET /owner/me
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/owner/me', verifyToken, authorize(['Food Business Owner']), restaurantController.getOwnerRestaurant);

// Public Routes
/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: GET /
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', restaurantController.getRestaurants);
/**
 * @swagger
 * /api/restaurants/{id}/menu:
 *   get:
 *     summary: GET /:id/menu
 *     tags: [Restaurant]
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
router.get('/:id/menu', restaurantController.getMenuItems);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: GET /:id
 *     tags: [Restaurant]
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
router.get('/:id', restaurantController.getRestaurantById);

// Secured Owner/Admin Routes
/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: POST /
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', verifyToken, authorize(['Food Business Owner', 'Admin']), validateRestaurant, restaurantController.createRestaurant);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: PUT /:id
 *     tags: [Restaurant]
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
router.put('/:id', verifyToken, authorize(['Food Business Owner', 'Admin']), validateRestaurant, restaurantController.updateRestaurant);

// Images Upload
/**
 * @swagger
 * /api/restaurants/{id}/images:
 *   post:
 *     summary: POST /:id/images
 *     tags: [Restaurant]
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
router.post('/:id/images', verifyToken, authorize(['Food Business Owner', 'Admin']), uploadLimiter, upload.array('images', 5), processCloudinaryUpload, restaurantController.uploadRestaurantImages);

// Menu Management
/**
 * @swagger
 * /api/restaurants/{id}/menu:
 *   post:
 *     summary: POST /:id/menu
 *     tags: [Restaurant]
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
router.post('/:id/menu', verifyToken, authorize(['Food Business Owner', 'Admin']), uploadLimiter, upload.single('image'), processCloudinaryUpload, restaurantController.addMenuItem);
/**
 * @swagger
 * /api/restaurants/menu/{itemId}:
 *   put:
 *     summary: PUT /menu/:itemId
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/menu/:itemId', verifyToken, authorize(['Food Business Owner', 'Admin']), uploadLimiter, upload.single('image'), processCloudinaryUpload, restaurantController.updateMenuItem);
/**
 * @swagger
 * /api/restaurants/menu/{itemId}:
 *   delete:
 *     summary: DELETE /menu/:itemId
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/menu/:itemId', verifyToken, authorize(['Food Business Owner', 'Admin']), restaurantController.deleteMenuItem);
/**
 * @swagger
 * /api/restaurants/{id}/menu/{itemId}:
 *   delete:
 *     summary: DELETE /:id/menu/:itemId
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id/menu/:itemId', verifyToken, authorize(['Food Business Owner', 'Admin']), restaurantController.deleteRestaurantMenuItem);

// Announcements
/**
 * @swagger
 * /api/restaurants/{id}/announcements:
 *   post:
 *     summary: POST /:id/announcements
 *     tags: [Restaurant]
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
router.post('/:id/announcements', verifyToken, authorize(['Food Business Owner', 'Admin']), uploadLimiter, upload.single('image'), processCloudinaryUpload, restaurantController.addAnnouncement);

// Verification Requests
/**
 * @swagger
 * /api/restaurants/{id}/verify:
 *   post:
 *     summary: POST /:id/verify
 *     tags: [Restaurant]
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
router.post('/:id/verify', verifyToken, authorize(['Food Business Owner']), uploadLimiter, upload.fields([
  { name: 'dti', maxCount: 1 },
  { name: 'barangay', maxCount: 1 },
  { name: 'owner_id', maxCount: 1 },
  { name: 'business_permit', maxCount: 1 }
]), processCloudinaryUpload, restaurantController.submitVerificationRequest);

module.exports = router;
