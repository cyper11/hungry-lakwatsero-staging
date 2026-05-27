// Post Routes
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post management
 */

const postController = require('../controllers/postController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { processCloudinaryUpload } = require('../middleware/cloudinaryUpload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Public
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: GET /
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', postController.getPosts);
/**
 * @swagger
 * /api/posts/restaurant/{restaurantId}:
 *   get:
 *     summary: GET /restaurant/:restaurantId
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/restaurant/:restaurantId', postController.getRestaurantPosts);
/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: GET /:id/comments
 *     tags: [Post]
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
router.get('/:id/comments', postController.getComments);

// Owner only
/**
 * @swagger
 * /api/posts/owner/mine:
 *   get:
 *     summary: GET /owner/mine
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/owner/mine', verifyToken, authorize(['Food Business Owner']), postController.getMyPosts);
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: POST /
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', verifyToken, authorize(['Food Business Owner']), uploadLimiter, upload.single('image'), processCloudinaryUpload, postController.createPost);
// ...existing PUT route...
router.put('/:id', verifyToken, authorize(['Food Business Owner']), uploadLimiter, upload.single('image'), processCloudinaryUpload, postController.updatePost);
/**
 * @swagger
 * /api/posts/{id}/pin:
 *   put:
 *     summary: PUT /:id/pin
 *     tags: [Post]
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
router.put('/:id/pin', verifyToken, authorize(['Food Business Owner']), postController.togglePin);

// Authenticated
/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: POST /:id/like
 *     tags: [Post]
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
router.post('/:id/like', verifyToken, postController.toggleLike);
/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: POST /:id/comments
 *     tags: [Post]
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
router.post('/:id/comments', verifyToken, postController.addComment);

// Owner or Admin
/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: DELETE /:id
 *     tags: [Post]
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
router.delete('/:id', verifyToken, postController.deletePost);

module.exports = router;
