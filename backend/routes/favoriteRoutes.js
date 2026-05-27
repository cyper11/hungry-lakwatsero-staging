// Favorite Routes – HungryLakwatsero
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: Favorite management
 */

const { getUserFavorites, addFavorite, removeFavorite, checkFavorite, toggleFavorite } = require('../controllers/favoriteController');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET /api/favoritess          – list user's favorites
/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: GET /
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authMiddleware, getUserFavorites);

// GET /api/favoritess/check/:restaurantId – must be before /:restaurantId to avoid route collision
/**
 * @swagger
 * /api/favorites/check/{restaurantId}:
 *   get:
 *     summary: GET /check/:restaurantId
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
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
router.get('/check/:restaurantId', authMiddleware, checkFavorite);

// POST /api/favoritess/toggle – frontend-compatible toggle endpoint
/**
 * @swagger
 * /api/favorites/toggle:
 *   post:
 *     summary: POST /toggle
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/toggle', authMiddleware, toggleFavorite);

// POST /api/favoritess – add to favorites
/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add to favorites
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', authMiddleware, addFavorite);

// DELETE /api/favoritess/:restaurantId – remove from favorites
/**
 * @swagger
 * /api/favorites/{restaurantId}:
 *   delete:
 *     summary: DELETE /:restaurantId
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
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
router.delete('/:restaurantId', authMiddleware, removeFavorite);

module.exports = router;
