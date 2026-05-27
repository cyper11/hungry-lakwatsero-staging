// Restaurant Controller
const db = require('../config/db');
const { logAction } = require('./authController');

const getRestaurants = async (req, res) => {
  try {
    const { municipality, cuisine, search } = req.query;
    let sql = `
      SELECT r.*, m.name as municipality_name, 
             COALESCE(AVG(rt.score), 0) as average_rating,
             COUNT(rt.id) as rating_count,
             (SELECT image_url FROM restaurant_images WHERE restaurant_id = r.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM restaurants r
      JOIN municipalities m ON r.municipality_id = m.id
      LEFT JOIN ratings rt ON r.id = rt.restaurant_id
      WHERE r.status = 'approved'
    `;
    const params = [];

    if (municipality) {
      sql += ` AND (m.id = ? OR m.name LIKE ?)`;
      params.push(municipality, `%${municipality}%`);
    }

    if (cuisine) {
      sql += ` AND r.id IN (SELECT DISTINCT restaurant_id FROM menu_items WHERE category LIKE ?)`;
      params.push(`%${cuisine}%`);
    }

    if (search) {
      sql += ` AND (r.name LIKE ? OR r.description LIKE ? OR r.address LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ` GROUP BY r.id ORDER BY average_rating DESC, r.created_at DESC`;

    const restaurants = await db.query(sql, params);
    res.json(restaurants);
  } catch (error) {
    console.error('getRestaurants error:', error);
    res.status(500).json({ message: 'Failed to retrieve restaurant listings.' });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurants = await db.query(
      `SELECT r.*, m.name as municipality_name,
              COALESCE(AVG(rt.score), 0) as average_rating,
              COUNT(rt.id) as rating_count
       FROM restaurants r
       JOIN municipalities m ON r.municipality_id = m.id
       LEFT JOIN ratings rt ON r.id = rt.restaurant_id
       WHERE r.id = ? GROUP BY r.id`,
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant profile not found.' });
    }

    const restaurant = restaurants[0];

    // Fetch images, menu, reviews, announcements
    const images = await db.query('SELECT * FROM restaurant_images WHERE restaurant_id = ?', [id]);
    const menuItems = await db.query('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name', [id]);
    const announcements = await db.query('SELECT * FROM announcements WHERE restaurant_id = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) ORDER BY created_at DESC', [id]);
    
    // Reviews with user profiles & comments
    const reviews = await db.query(
      `SELECT r.*, u.username, u.first_name, u.last_name, u.avatar_url 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.restaurant_id = ? ORDER BY r.created_at DESC`,
      [id]
    );

    // Fetch comments (responses) for these reviews
    for (const review of reviews) {
      const comments = await db.query(
        `SELECT c.*, u.username, u.first_name, u.last_name, u.role_id 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.review_id = ? ORDER BY c.created_at ASC`,
        [review.id]
      );
      review.comments = comments;
    }

    res.json({
      ...restaurant,
      images,
      menuItems,
      reviews,
      announcements
    });
  } catch (error) {
    console.error('getRestaurantById error:', error);
    res.status(500).json({ message: 'Failed to retrieve restaurant details.' });
  }
};

const getMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await db.query('SELECT id FROM restaurants WHERE id = ?', [id]);
    if (restaurant.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const menuItems = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name',
      [id]
    );
    res.json(menuItems);
  } catch (error) {
    console.error('getMenuItems error:', error);
    res.status(500).json({ message: 'Failed to load menu items.' });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, contactInfo, businessHours, historyStory, municipalityId } = req.body;
    const ownerId = req.user.id;

    // Check if owner already owns a listing
    const existing = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [ownerId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Business owners are limited to one restaurant profile listing.' });
    }

    const result = await db.query(
      `INSERT INTO restaurants (owner_id, municipality_id, name, description, address, latitude, longitude, contact_info, business_hours, history_story, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [ownerId, municipalityId, name, description, address, Number(latitude), Number(longitude), contactInfo, businessHours, historyStory]
    );
    const restaurantId = result.insertId;

    // Log action
    await logAction(ownerId, 'CREATE_RESTAURANT', 'restaurants', restaurantId, { name }, req.ip);

    res.status(201).json({
      message: 'Restaurant profile created! It is currently pending administrator verification.',
      restaurantId
    });
  } catch (error) {
    console.error('createRestaurant error:', error);
    res.status(500).json({ message: 'Failed to create restaurant listing.' });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, latitude, longitude, contactInfo, businessHours, historyStory, municipalityId } = req.body;
    const ownerId = req.user.id;

    // Verify ownership or admin status
    const target = await db.query('SELECT owner_id FROM restaurants WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ message: 'Restaurant profile not found.' });
    }

    if (target[0].owner_id !== ownerId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Access denied. You do not own this restaurant listing.' });
    }

    await db.query(
      `UPDATE restaurants 
       SET name = ?, description = ?, address = ?, latitude = ?, longitude = ?, contact_info = ?, business_hours = ?, history_story = ?, municipality_id = ?
       WHERE id = ?`,
      [name, description, address, Number(latitude), Number(longitude), contactInfo, businessHours, historyStory, municipalityId, id]
    );

    await logAction(ownerId, 'UPDATE_RESTAURANT', 'restaurants', id, { name }, req.ip);

    res.json({ message: 'Restaurant profile updated successfully!' });
  } catch (error) {
    console.error('updateRestaurant error:', error);
    res.status(500).json({ message: 'Failed to update restaurant profile.' });
  }
};

const uploadRestaurantImages = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const target = await db.query('SELECT owner_id FROM restaurants WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    if (target[0].owner_id !== ownerId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded.' });
    }

    for (const file of req.files) {
      const url = `/uploads/${file.filename}`;
      // Check if primary image already exists
      const existingPrimary = await db.query('SELECT id FROM restaurant_images WHERE restaurant_id = ? AND is_primary = TRUE', [id]);
      const isPrimary = existingPrimary.length === 0;

      await db.query(
        'INSERT INTO restaurant_images (restaurant_id, image_url, is_primary) VALUES (?, ?, ?)',
        [id, url, isPrimary]
      );
    }

    res.json({ message: 'Images uploaded successfully!' });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed.' });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const { id } = req.params; // restaurant ID
    const { name, description, price, category } = req.body;
    const ownerId = req.user.id;

    // Verify ownership
    const target = await db.query('SELECT owner_id FROM restaurants WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ message: 'Restaurant profile not found.' });
    }

    if (target[0].owner_id !== ownerId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    await db.query(
      'INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, Number(price), category, imageUrl]
    );

    res.status(201).json({ message: 'Menu item added successfully!' });
  } catch (error) {
    console.error('addMenuItem error:', error);
    res.status(500).json({ message: 'Failed to add menu item.' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const items = await db.query('SELECT r.owner_id, m.restaurant_id FROM menu_items m JOIN restaurants r ON m.restaurant_id = r.id WHERE m.id = ?', [itemId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    if (items[0].owner_id !== req.user.id && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await db.query('DELETE FROM menu_items WHERE id = ?', [itemId]);
    res.json({ message: 'Menu item deleted.' });
  } catch (error) {
    console.error('deleteMenuItem error:', error);
    res.status(500).json({ message: 'Failed to delete menu item.' });
  }
};

const deleteRestaurantMenuItem = deleteMenuItem;

const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, category, image_url } = req.body;
    const ownerId = req.user.id;

    // Verify ownership
    const items = await db.query('SELECT r.owner_id, m.restaurant_id, m.image_url FROM menu_items m JOIN restaurants r ON m.restaurant_id = r.id WHERE m.id = ?', [itemId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    if (items[0].owner_id !== ownerId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    let imageUrl = image_url || items[0].image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    await db.query(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?',
      [name, description, Number(price), category, imageUrl, itemId]
    );

    res.json({ message: 'Menu item updated successfully!' });
  } catch (error) {
    console.error('updateMenuItem error:', error);
    res.status(500).json({ message: 'Failed to update menu item.' });
  }
};

const submitVerificationRequest = async (req, res) => {
  try {
    const { id } = req.params; // restaurant ID
    const ownerId = req.user.id;

    // Verify restaurant is owned by user
    const target = await db.query('SELECT owner_id FROM restaurants WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    if (target[0].owner_id !== ownerId) {
      if (req.user.roleId !== 3) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    if (target[0].owner_id !== ownerId && req.user.roleId !== 3) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const files = req.files || {};
    const dtiUrl = files['dti'] ? `/uploads/${files['dti'][0].filename}` : null;
    const barangayUrl = files['barangay'] ? `/uploads/${files['barangay'][0].filename}` : null;
    const ownerIdUrl = files['owner_id'] ? `/uploads/${files['owner_id'][0].filename}` : null;
    const businessPermitUrl = files['business_permit'] ? `/uploads/${files['business_permit'][0].filename}` : null;

    const documentUrl = businessPermitUrl || dtiUrl || barangayUrl || ownerIdUrl;
    if (!documentUrl) {
      return res.status(400).json({ message: 'At least one verification document is required.' });
    }

    // Insert request
    await db.query(
      `INSERT INTO verification_requests (owner_id, restaurant_id, document_url, dti_url, barangay_clearance_url, owner_id_url, business_permit_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [ownerId, id, documentUrl, dtiUrl, barangayUrl, ownerIdUrl, businessPermitUrl]
    );

    // Update restaurant status to pending
    await db.query('UPDATE restaurants SET status = \'pending\' WHERE id = ?', [id]);

    res.status(201).json({ message: 'Verification application submitted. Administrators will review it shortly.' });
  } catch (error) {
    console.error('submitVerification error:', error);
    res.status(500).json({ message: 'Failed to submit verification request.' });
  }
};

const getOwnerRestaurant = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const restaurants = await db.query('SELECT * FROM restaurants WHERE owner_id = ?', [ownerId]);
    if (restaurants.length === 0) {
      return res.json(null);
    }
    const restaurant = restaurants[0];
    const images = await db.query('SELECT * FROM restaurant_images WHERE restaurant_id = ?', [restaurant.id]);
    const menuItems = await db.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurant.id]);
    const verifications = await db.query('SELECT * FROM verification_requests WHERE restaurant_id = ? ORDER BY created_at DESC', [restaurant.id]);

    res.json({
      ...restaurant,
      images,
      menuItems,
      verificationRequest: verifications[0] || null
    });
  } catch (error) {
    console.error('getOwnerRestaurant error:', error);
    res.status(500).json({ message: 'Failed to load business listing.' });
  }
};

const addAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, expiresAt } = req.body;
    const ownerId = req.user.id;

    const target = await db.query('SELECT owner_id FROM restaurants WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }
    if (target[0].owner_id !== ownerId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const mysqlExpiresAt = expiresAt ? new Date(expiresAt).toISOString().slice(0, 19).replace('T', ' ') : null;

    await db.query(
      'INSERT INTO announcements (restaurant_id, title, content, image_url, expires_at) VALUES (?, ?, ?, ?, ?)',
      [id, title, content, imageUrl, mysqlExpiresAt]
    );

    res.status(201).json({ message: 'Announcement posted!' });
  } catch (error) {
    console.error('addAnnouncement error:', error);
    res.status(500).json({ message: 'Failed to post announcement.' });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  getMenuItems,
  uploadRestaurantImages,
  addMenuItem,
  deleteMenuItem,
  deleteRestaurantMenuItem,
  updateMenuItem,
  submitVerificationRequest,
  getOwnerRestaurant,
  addAnnouncement
};
