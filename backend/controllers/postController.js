// Post Controller — Handles business content posts for Food Owners
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET /api/posts — public, paginated feed
exports.getPosts = async (req, res) => {
  try {
    const { restaurantId, type, municipality, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = ['p.status = ?'];
    let params = ['published'];

    if (restaurantId) { where.push('p.restaurant_id = ?'); params.push(restaurantId); }
    if (type && type !== 'all') { where.push('p.post_type = ?'); params.push(type); }
    if (municipality) { where.push('m.name = ?'); params.push(municipality); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const posts = await db.query(`
      SELECT p.*, 
             r.name AS restaurant_name, m.name AS municipality_name, r.status AS restaurant_status,
             u.first_name, u.last_name,
             (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count,
             (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count
      FROM posts p
      LEFT JOIN restaurants r ON p.restaurant_id = r.id
      LEFT JOIN municipalities m ON r.municipality_id = m.id
      LEFT JOIN users u ON p.owner_id = u.id
      ${whereClause}
      ORDER BY p.pinned DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({ posts, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getPosts error:', err);
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
};

// GET /api/posts/restaurant/:restaurantId — public, posts for one restaurant
exports.getRestaurantPosts = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const posts = await db.query(`
      SELECT p.*,
             r.name AS restaurant_name, m.name AS municipality_name,
             u.first_name, u.last_name,
             (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count,
             (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count
      FROM posts p
      LEFT JOIN restaurants r ON p.restaurant_id = r.id
      LEFT JOIN municipalities m ON r.municipality_id = m.id
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.restaurant_id = ? AND p.status = 'published'
      ORDER BY p.pinned DESC, p.created_at DESC
    `, [restaurantId]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch restaurant posts' });
  }
};

// POST /api/posts — owner only
exports.createPost = async (req, res) => {
  try {
    const { restaurantId, caption, postType = 'update', hashtags, lat, lng, locationLabel, audience = 'public' } = req.body;
    const ownerId = req.user.id;

    // Verify ownership
    const restaurants = await db.query('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, ownerId]);
    if (!restaurants.length) return res.status(403).json({ message: 'You do not own this restaurant.' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const hashtagsJson = hashtags ? JSON.stringify(typeof hashtags === 'string' ? hashtags.split(',').map(h => h.trim()) : hashtags) : '[]';

    const result = await db.query(`
      INSERT INTO posts (restaurant_id, owner_id, caption, post_type, image_url, hashtags, lat, lng, location_label, audience, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
    `, [restaurantId, ownerId, caption || '', postType, imageUrl, hashtagsJson, lat || null, lng || null, locationLabel || null, audience]);

    const post = await db.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Post created!', post: post[0] });
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};

// PUT /api/posts/:id — owner only, own posts
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, postType, hashtags, lat, lng, locationLabel } = req.body;
    const ownerId = req.user.id;

    const existing = await db.query('SELECT * FROM posts WHERE id = ? AND owner_id = ?', [id, ownerId]);
    if (!existing.length) return res.status(404).json({ message: 'Post not found or not authorized.' });

    const hashtagsJson = hashtags ? JSON.stringify(typeof hashtags === 'string' ? hashtags.split(',').map(h => h.trim()) : hashtags) : existing[0].hashtags;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existing[0].image_url;

    await db.query(`
      UPDATE posts SET caption=?, post_type=?, hashtags=?, lat=?, lng=?, location_label=?, image_url=?, updated_at=CURRENT_TIMESTAMP
      WHERE id = ? AND owner_id = ?
    `, [caption, postType || existing[0].post_type, hashtagsJson, lat || null, lng || null, locationLabel || null, imageUrl, id, ownerId]);

    res.json({ message: 'Post updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const isAdmin = req.user.roleId === 3;

    const existing = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Post not found.' });
    if (!isAdmin && existing[0].owner_id !== ownerId) return res.status(403).json({ message: 'Not authorized.' });

    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// POST /api/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await db.query('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
    if (existing.length) {
      await db.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
      res.json({ liked: false });
    } else {
      await db.query('INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [id, userId]);
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

// GET /api/posts/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await db.query(`
      SELECT pc.*, u.first_name, u.last_name, u.username
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = ?
      ORDER BY pc.created_at ASC
    `, [req.params.id]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty.' });
    const result = await db.query(
      'INSERT INTO post_comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [req.params.id, req.user.id, content.trim()]
    );
    res.status(201).json({ message: 'Comment added.', commentId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// PUT /api/posts/:id/pin — owner only
exports.togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT pinned FROM posts WHERE id = ? AND owner_id = ?', [id, req.user.id]);
    if (!existing.length) return res.status(404).json({ message: 'Not found' });
    await db.query('UPDATE posts SET pinned = ? WHERE id = ?', [existing[0].pinned ? 0 : 1, id]);
    res.json({ pinned: !existing[0].pinned });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
};

// GET /api/posts/owner/mine — owner's own posts (all statuses)
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await db.query(`
      SELECT p.*,
             (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count,
             (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count
      FROM posts p
      WHERE p.owner_id = ?
      ORDER BY p.pinned DESC, p.created_at DESC
    `, [req.user.id]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your posts' });
  }
};
