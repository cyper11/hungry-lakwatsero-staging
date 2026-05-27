// Food Stories (CMS) Controller
const db = require('../config/db');
const { logAction } = require('./authController');

const getStories = async (req, res) => {
  try {
    const { municipalityId, search } = req.query;
    let sql = `
      SELECT f.*, m.name as municipality_name, u.username as author_name 
      FROM food_stories f
      JOIN municipalities m ON f.municipality_id = m.id
      JOIN users u ON f.author_id = u.id
      WHERE f.status = 'published'
    `;
    const params = [];

    // Admins can see draft stories too
    if (req.user && req.user.role === 'Admin') {
      sql = `
        SELECT f.*, m.name as municipality_name, u.username as author_name 
        FROM food_stories f
        JOIN municipalities m ON f.municipality_id = m.id
        JOIN users u ON f.author_id = u.id
        WHERE 1=1
      `;
    }

    if (municipalityId) {
      sql += ` AND f.municipality_id = ?`;
      params.push(municipalityId);
    }

    if (search) {
      sql += ` AND (f.title LIKE ? OR f.content LIKE ? OR f.traditional_dishes LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ` ORDER BY f.created_at DESC`;

    const stories = await db.query(sql, params);
    res.json(stories);
  } catch (error) {
    console.error('getStories error:', error);
    res.status(500).json({ message: 'Failed to retrieve food stories.' });
  }
};

const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const stories = await db.query(
      `SELECT f.*, m.name as municipality_name, u.username as author_name 
       FROM food_stories f
       JOIN municipalities m ON f.municipality_id = m.id
       JOIN users u ON f.author_id = u.id
       WHERE f.id = ?`,
      [id]
    );

    if (stories.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    res.json(stories[0]);
  } catch (error) {
    console.error('getStoryById error:', error);
    res.status(500).json({ message: 'Failed to retrieve story.' });
  }
};

const createStory = async (req, res) => {
  try {
    const { title, content, municipalityId, traditionalDishes, status } = req.body;
    const authorId = req.user.id;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      'INSERT INTO food_stories (title, content, author_id, municipality_id, traditional_dishes, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, authorId, municipalityId, traditionalDishes, imageUrl, status || 'draft']
    );

    await logAction(authorId, 'CREATE_STORY', 'food_stories', result.insertId, { title }, req.ip);

    res.status(201).json({ message: 'Food story created successfully!', storyId: result.insertId });
  } catch (error) {
    console.error('createStory error:', error);
    res.status(500).json({ message: 'Failed to create food story.' });
  }
};

const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, municipalityId, traditionalDishes, status } = req.body;
    const authorId = req.user.id;

    const existing = await db.query('SELECT image_url FROM food_stories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    let imageUrl = existing[0].image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    await db.query(
      'UPDATE food_stories SET title = ?, content = ?, municipality_id = ?, traditional_dishes = ?, image_url = ?, status = ? WHERE id = ?',
      [title, content, municipalityId, traditionalDishes, imageUrl, status, id]
    );

    await logAction(authorId, 'UPDATE_STORY', 'food_stories', id, { title }, req.ip);

    res.json({ message: 'Food story updated successfully!' });
  } catch (error) {
    console.error('updateStory error:', error);
    res.status(500).json({ message: 'Failed to update food story.' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT id FROM food_stories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    await db.query('DELETE FROM food_stories WHERE id = ?', [id]);
    await logAction(req.user.id, 'DELETE_STORY', 'food_stories', id, {}, req.ip);

    res.json({ message: 'Food story deleted successfully.' });
  } catch (error) {
    console.error('deleteStory error:', error);
    res.status(500).json({ message: 'Failed to delete food story.' });
  }
};

const getMunicipalities = async (req, res) => {
  try {
    const list = await db.query('SELECT * FROM municipalities ORDER BY name');
    res.json(list);
  } catch (error) {
    console.error('getMunicipalities error:', error);
    res.status(500).json({ message: 'Failed to retrieve municipalities.' });
  }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getMunicipalities
};
