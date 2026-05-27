// Food Story Routes
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Story
 *   description: Story management
 */

const storyController = require('../controllers/storyController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { processCloudinaryUpload } = require('../middleware/cloudinaryUpload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const env = require('../config/env');

// Soft auth helper to read token optional (does not block if no token is passed)
const jwt = require('jsonwebtoken');
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
        // Map ID to roles string dynamically
        req.user.role = decoded.roleId === 3 ? 'Admin' : 'User';
      }
      next();
    });
  } else {
    next();
  }
};

router.use(sanitizeInput);

// Public listings
/**
 * @swagger
 * /api/stories:
 *   get:
 *     summary: GET /
 *     tags: [Story]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', optionalAuth, storyController.getStories);
/**
 * @swagger
 * /api/stories/municipalities:
 *   get:
 *     summary: GET /municipalities
 *     tags: [Story]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/municipalities', storyController.getMunicipalities);
/**
 * @swagger
 * /api/stories/{id}:
 *   get:
 *     summary: GET /:id
 *     tags: [Story]
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
router.get('/:id', storyController.getStoryById);

// Secured CMS management (Admin-only)
/**
 * @swagger
 * /api/stories:
 *   post:
 *     summary: POST /
 *     tags: [Story]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', verifyToken, authorize(['Admin']), uploadLimiter, upload.single('image'), processCloudinaryUpload, storyController.createStory);
// ...existing PUT route...
router.put('/:id', verifyToken, authorize(['Admin']), uploadLimiter, upload.single('image'), processCloudinaryUpload, storyController.updateStory);
/**
 * @swagger
 * /api/stories/{id}:
 *   delete:
 *     summary: DELETE /:id
 *     tags: [Story]
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
router.delete('/:id', verifyToken, authorize(['Admin']), storyController.deleteStory);

module.exports = router;
