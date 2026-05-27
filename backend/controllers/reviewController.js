// Review and Community Controller
const db = require('../config/db');
const { logAction } = require('./authController');

const upsertRating = async (restaurantId, userId, ratingValue) => {
  const result = await db.query(
    'UPDATE ratings SET score = ? WHERE restaurant_id = ? AND user_id = ?',
    [Number(ratingValue), restaurantId, userId]
  );
  if ((result.affectedRows ?? 0) === 0) {
    await db.query(
      'INSERT INTO ratings (restaurant_id, user_id, score) VALUES (?, ?, ?)',
      [restaurantId, userId, Number(ratingValue)]
    );
  }
};

const getReviews = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const params = [];
    let where = '';

    if (restaurantId) {
      where = 'WHERE r.restaurant_id = ?';
      params.push(restaurantId);
    }

    const reviews = await db.query(
      `SELECT r.*, u.username, u.first_name, u.last_name, u.avatar_url,
              rest.name as restaurant_name, m.name as municipality_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN restaurants rest ON r.restaurant_id = rest.id
       JOIN municipalities m ON rest.municipality_id = m.id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );

    for (const review of reviews) {
      const comments = await db.query(
        `SELECT c.*, u.username, u.first_name, u.last_name, u.role_id
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.review_id = ?
         ORDER BY c.created_at ASC`,
        [review.id]
      );
      review.comments = comments;
      review.response = comments[0]?.content || null;
      review.restaurant = {
        id: review.restaurant_id,
        name: review.restaurant_name,
        municipality_name: review.municipality_name
      };
    }

    res.json(reviews);
  } catch (error) {
    console.error('getReviews error:', error);
    res.status(500).json({ message: 'Failed to retrieve reviews.' });
  }
};

const addReview = async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { content, ratingValue } = req.body;
    const userId = req.user.id;

    // Check if user has already reviewed this restaurant
    const existing = await db.query('SELECT id FROM reviews WHERE user_id = ? AND restaurant_id = ?', [userId, restaurantId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already submitted a review for this establishment.' });
    }

    const restaurant = await db.query('SELECT id FROM restaurants WHERE id = ?', [restaurantId]);
    if (restaurant.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Insert Review
    const reviewResult = await db.query(
      'INSERT INTO reviews (restaurant_id, user_id, content, rating_value, image_url) VALUES (?, ?, ?, ?, ?)',
      [restaurantId, userId, content, Number(ratingValue), imageUrl]
    );
    const reviewId = reviewResult.insertId;

    // Also Insert Rating (to sync ratings table requirement)
    try {
      await upsertRating(restaurantId, userId, ratingValue);
    } catch (ratingErr) {
      // Rollback: delete the review we just inserted
      await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]).catch(() => {});
      throw ratingErr;
    }

    await logAction(userId, 'CREATE_REVIEW', 'reviews', reviewId, { ratingValue }, req.ip);

    res.status(201).json({ message: 'Review posted successfully!', reviewId });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(500).json({ message: 'Failed to post review.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verify ownership of the restaurant being commented on, or if Admin
    const reviews = await db.query(
      'SELECT r.restaurant_id, rest.owner_id FROM reviews r JOIN restaurants rest ON r.restaurant_id = rest.id WHERE r.id = ?',
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const { owner_id } = reviews[0];

    // Restrict comments to restaurant owners or administrators
    if (owner_id !== userId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Only the business owner or admin can respond to this review.' });
    }

    const result = await db.query(
      'INSERT INTO comments (review_id, user_id, content) VALUES (?, ?, ?)',
      [reviewId, userId, content]
    );

    await logAction(userId, 'CREATE_COMMENT', 'comments', result.insertId, { reviewId }, req.ip);

    res.status(201).json({ message: 'Response posted successfully!' });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ message: 'Failed to post response comment.' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const userId = req.user.id;

    const existing = await db.query('SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?', [userId, restaurantId]);
    
    if (existing.length > 0) {
      // Unfavorite
      await db.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
      res.json({ isFavorite: false, message: 'Removed from favorites.' });
    } else {
      // Favorite
      await db.query('INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)', [userId, restaurantId]);
      res.json({ isFavorite: true, message: 'Added to favorites!' });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    res.status(500).json({ message: 'Failed to process favorite request.' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await db.query(
      `SELECT f.id as favorite_id, r.*, m.name as municipality_name,
              COALESCE((SELECT AVG(rt.score) FROM ratings rt WHERE rt.restaurant_id = r.id), 0) as average_rating,
              (SELECT image_url FROM restaurant_images WHERE restaurant_id = r.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM favorites f
       JOIN restaurants r ON f.restaurant_id = r.id
       JOIN municipalities m ON r.municipality_id = m.id
       WHERE f.user_id = ?`,
      [userId]
    );

    res.json(favorites);
  } catch (error) {
    console.error('getFavorites error:', error);
    res.status(500).json({ message: 'Failed to load favorite restaurants.' });
  }
};

const reportContent = async (req, res) => {
  try {
    const { entityType, entityId, reason } = req.body;
    const reporterId = req.user.id;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: 'Please provide a valid reporting reason.' });
    }

    const result = await db.query(
      'INSERT INTO reports (reporter_id, entity_type, entity_id, reason, status) VALUES (?, ?, ?, ?, \'pending\')',
      [reporterId, entityType, entityId, reason]
    );

    await logAction(reporterId, 'REPORT_CONTENT', 'reports', result.insertId, { entityType, entityId }, req.ip);

    res.status(201).json({ message: 'Report submitted. Moderators will investigate.' });
  } catch (error) {
    console.error('reportContent error:', error);
    res.status(500).json({ message: 'Failed to submit report.' });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT r.*, rest.name as restaurant_name, m.name as municipality_name
      FROM reviews r
      JOIN restaurants rest ON r.restaurant_id = rest.id
      JOIN municipalities m ON rest.municipality_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const reviews = await db.query(sql, [userId]);
    const mapped = reviews.map((r) => ({
      ...r,
      restaurant: {
        id: r.restaurant_id,
        name: r.restaurant_name,
        municipality_name: r.municipality_name
      }
    }));
    res.json(mapped);
  } catch (error) {
    console.error('getMyReviews error:', error);
    res.status(500).json({ message: 'Failed to retrieve your reviews.' });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, ratingValue } = req.body;
    const userId = req.user.id;

    const existing = await db.query('SELECT user_id, restaurant_id FROM reviews WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (existing[0].user_id !== userId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'You can only edit your own reviews.' });
    }

    await db.query('UPDATE reviews SET content = ?, rating_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [content, Number(ratingValue), id]);
    await upsertRating(existing[0].restaurant_id, userId, ratingValue);

    res.json({ message: 'Review updated successfully!' });
  } catch (error) {
    console.error('updateReview error:', error);
    res.status(500).json({ message: 'Failed to update review.' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await db.query('SELECT user_id, restaurant_id FROM reviews WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (existing[0].user_id !== userId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }

    const { restaurant_id } = existing[0];

    // Snapshot rating for potential rollback
    const ratingRows = await db.query(
      'SELECT score FROM ratings WHERE restaurant_id = ? AND user_id = ?',
      [restaurant_id, userId]
    );
    const ratingScore = ratingRows.length > 0 ? ratingRows[0].score : null;

    // Delete rating first so review deletion is the final gate
    await db.query('DELETE FROM ratings WHERE restaurant_id = ? AND user_id = ?', [restaurant_id, userId]);

    try {
      await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    } catch (reviewDeleteErr) {
      // Compensating rollback: re-insert the rating if review deletion fails
      if (ratingScore !== null) {
        await db.query(
          'INSERT INTO ratings (restaurant_id, user_id, score) VALUES (?, ?, ?)',
          [restaurant_id, userId, ratingScore]
        ).catch(() => {});
      }
      throw reviewDeleteErr;
    }

    res.json({ message: 'Review deleted successfully!' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ message: 'Failed to delete review.' });
  }
};

module.exports = {
  getReviews,
  addReview,
  addComment,
  toggleFavorite,
  getFavorites,
  reportContent,
  getMyReviews,
  updateReview,
  deleteReview
};
