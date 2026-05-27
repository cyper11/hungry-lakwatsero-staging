// Favorites Controller – HungryLakwatsero
const db = require('../config/db');

/**
 * GET /api/favorites
 * Returns all favorited restaurants for the authenticated user,
 * including primary image, municipality name, and aggregated rating data.
 */
const getUserFavorites = async (req, res) => {
  try {
    const sql = `
      SELECT
        f.id AS favorite_id,
        f.restaurant_id,
        r.*,
        ri.image_url        AS primary_image,
        m.name              AS municipality_name,
        COALESCE(AVG(rat.score), 0) AS average_rating,
        COUNT(DISTINCT rat.id)      AS rating_count
      FROM favorites f
      JOIN restaurants r       ON f.restaurant_id  = r.id
      LEFT JOIN restaurant_images ri
             ON ri.restaurant_id = r.id AND ri.is_primary = TRUE
      LEFT JOIN municipalities m  ON r.municipality_id = m.id
      LEFT JOIN ratings rat       ON r.id = rat.restaurant_id
      WHERE f.user_id = ?
      GROUP BY r.id
      ORDER BY f.created_at DESC
    `;

    const favorites = await db.query(sql, [req.user.id]);

    return res.status(200).json(favorites);
  } catch (error) {
    console.error('getUserFavorites error:', error);
    return res.status(500).json({ message: 'Failed to retrieve favorites.' });
  }
};

/**
 * POST /api/favorites/:restaurantId
 * Adds a restaurant to the authenticated user's favorites.
 */
const addFavorite = async (req, res) => {
  try {
    const restaurantId = parseInt(req.body.restaurantId ?? req.params.restaurantId, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID.' });
    }

    // Verify restaurant exists
    const restaurants = await db.query(
      'SELECT id FROM restaurants WHERE id = ?',
      [restaurantId]
    );
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // Check for duplicate favorite
    const existing = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?',
      [req.user.id, restaurantId]
    );
    if (existing.length > 0) {
      return res.status(200).json({ isFavorite: true, message: 'Restaurant is already in your favorites.' });
    }

    await db.query(
      'INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)',
      [req.user.id, restaurantId]
    );

    return res.status(201).json({ isFavorite: true, message: 'Restaurant added to favorites.' });
  } catch (error) {
    console.error('addFavorite error:', error);
    return res.status(500).json({ message: 'Failed to add favorite.' });
  }
};

/**
 * DELETE /api/favorites/:restaurantId
 * Removes a restaurant from the authenticated user's favorites.
 */
const removeFavorite = async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID.' });
    }

    const result = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?',
      [req.user.id, restaurantId]
    );

    // db.query returns an object with affectedRows for mutations
    const affected = result.affectedRows ?? result.changes ?? 0;
    if (affected === 0) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    return res.status(200).json({ isFavorite: false, message: 'Restaurant removed from favorites.' });
  } catch (error) {
    console.error('removeFavorite error:', error);
    return res.status(500).json({ message: 'Failed to remove favorite.' });
  }
};

/**
 * GET /api/favorites/check/:restaurantId
 * Returns whether the authenticated user has favorited a specific restaurant.
 */
const checkFavorite = async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID.' });
    }

    const rows = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?',
      [req.user.id, restaurantId]
    );

    return res.status(200).json({
      message: 'Favorite status retrieved.',
      isFavorite: rows.length > 0,
      data: { isFavorited: rows.length > 0 }
    });
  } catch (error) {
    console.error('checkFavorite error:', error);
    return res.status(500).json({ message: 'Failed to check favorite status.' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const restaurantId = parseInt(req.body.restaurantId ?? req.params.restaurantId, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID.' });
    }

    const restaurants = await db.query('SELECT id FROM restaurants WHERE id = ?', [restaurantId]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const existing = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?',
      [req.user.id, restaurantId]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
      return res.json({ isFavorite: false, message: 'Removed from favorites.' });
    }

    await db.query('INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)', [req.user.id, restaurantId]);
    return res.json({ isFavorite: true, message: 'Added to favorites!' });
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return res.status(500).json({ message: 'Failed to process favorite request.' });
  }
};

module.exports = { getUserFavorites, addFavorite, removeFavorite, checkFavorite, toggleFavorite };
