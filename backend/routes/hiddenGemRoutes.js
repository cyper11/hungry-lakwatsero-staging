// Hidden Gem Routes – HungryLakwatsero
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: HiddenGem
 *   description: HiddenGem management
 */

const {
  getHiddenGems,
  suggestHiddenGem,
  voteHiddenGem,
  getMyGems,
  approveGem,
  rejectGem
} = require('../controllers/hiddenGemController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// GET /api/hidden-gems          – public: all approved gems, sorted by votes
/**
 * @swagger
 * /api/hidden-gems:
 *   get:
 *     summary: GET /
 *     tags: [HiddenGem]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', getHiddenGems);

// GET /api/hidden-gems/mine     – auth: gems suggested by current user (must be before /:id routes)
/**
 * @swagger
 * /api/hidden-gems/mine:
 *   get:
 *     summary: GET /mine
 *     tags: [HiddenGem]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/mine', authMiddleware, getMyGems);

// POST /api/hidden-gems         – auth: suggest a new hidden gem
/**
 * @swagger
 * /api/hidden-gems:
 *   post:
 *     summary: POST /
 *     tags: [HiddenGem]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', authMiddleware, suggestHiddenGem);

// POST /api/hidden-gems/:id/vote – auth: upvote an approved gem
/**
 * @swagger
 * /api/hidden-gems/{id}/vote:
 *   post:
 *     summary: POST /:id/vote
 *     tags: [HiddenGem]
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
router.post('/:id/vote', authMiddleware, voteHiddenGem);

// PUT /api/hidden-gems/:id/approve – admin only
/**
 * @swagger
 * /api/hidden-gems/{id}/approve:
 *   put:
 *     summary: PUT /:id/approve
 *     tags: [HiddenGem]
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
router.put('/:id/approve', authMiddleware, requireRole('admin'), approveGem);

// PUT /api/hidden-gems/:id/reject  – admin only
/**
 * @swagger
 * /api/hidden-gems/{id}/reject:
 *   put:
 *     summary: PUT /:id/reject
 *     tags: [HiddenGem]
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
router.put('/:id/reject', authMiddleware, requireRole('admin'), rejectGem);

module.exports = router;
