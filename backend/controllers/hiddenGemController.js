// Hidden Gem Controller – HungryLakwatsero
const db = require('../config/db');

/**
 * GET /api/hidden-gems
 * Returns all approved hidden gems, joined with municipality name, ordered by votes DESC.
 * Public endpoint – no auth required.
 */
const getHiddenGems = async (req, res) => {
  try {
    const sql = `
      SELECT
        hg.*,
        m.name AS municipality_name
      FROM hidden_gems hg
      LEFT JOIN municipalities m ON hg.municipality_id = m.id
      WHERE hg.status = 'approved'
      ORDER BY hg.votes DESC
    `;

    const gems = await db.query(sql, []);

    return res.status(200).json({
      message: 'Hidden gems retrieved successfully.',
      data: gems
    });
  } catch (error) {
    console.error('getHiddenGems error:', error);
    return res.status(500).json({ message: 'Failed to retrieve hidden gems.' });
  }
};

/**
 * POST /api/hidden-gems
 * Authenticated – allows any user to suggest a new hidden gem.
 * Body: { restaurant_name, address, municipality_id, description }
 */
const suggestHiddenGem = async (req, res) => {
  try {
    const { restaurant_name, address, municipality_id, description } = req.body;

    if (!restaurant_name || !address || !municipality_id) {
      return res.status(400).json({
        message: 'restaurant_name, address, and municipality_id are required.'
      });
    }

    // Validate municipality exists
    const municipalities = await db.query(
      'SELECT id FROM municipalities WHERE id = ?',
      [municipality_id]
    );
    if (municipalities.length === 0) {
      return res.status(404).json({ message: 'Municipality not found.' });
    }

    const sql = `
      INSERT INTO hidden_gems
        (suggester_id, restaurant_name, address, municipality_id, description, status, votes)
      VALUES (?, ?, ?, ?, ?, 'pending', 0)
    `;

    const result = await db.query(sql, [
      req.user.id,
      restaurant_name,
      address,
      municipality_id,
      description || null
    ]);

    const insertId = result.insertId ?? result.lastID;

    return res.status(201).json({
      message: 'Hidden gem suggestion submitted for review.',
      data: { id: insertId }
    });
  } catch (error) {
    console.error('suggestHiddenGem error:', error);
    return res.status(500).json({ message: 'Failed to submit hidden gem suggestion.' });
  }
};

/**
 * POST /api/hidden-gems/:id/vote
 * Authenticated – increments the vote count for an approved hidden gem by 1.
 */
const voteHiddenGem = async (req, res) => {
  try {
    const gemId = parseInt(req.params.id, 10);
    if (isNaN(gemId)) {
      return res.status(400).json({ message: 'Invalid hidden gem ID.' });
    }

    // Ensure gem exists and is approved
    const gems = await db.query(
      "SELECT id, votes FROM hidden_gems WHERE id = ? AND status = 'approved'",
      [gemId]
    );
    if (gems.length === 0) {
      return res.status(404).json({ message: 'Approved hidden gem not found.' });
    }

    await db.query(
      'UPDATE hidden_gems SET votes = votes + 1 WHERE id = ?',
      [gemId]
    );

    return res.status(200).json({
      message: 'Vote recorded.',
      data: { votes: gems[0].votes + 1 }
    });
  } catch (error) {
    console.error('voteHiddenGem error:', error);
    return res.status(500).json({ message: 'Failed to record vote.' });
  }
};

/**
 * GET /api/hidden-gems/mine
 * Authenticated – returns all gems suggested by the current user (any status).
 */
const getMyGems = async (req, res) => {
  try {
    const sql = `
      SELECT
        hg.*,
        m.name AS municipality_name
      FROM hidden_gems hg
      LEFT JOIN municipalities m ON hg.municipality_id = m.id
      WHERE hg.suggester_id = ?
      ORDER BY hg.created_at DESC
    `;

    const gems = await db.query(sql, [req.user.id]);

    return res.status(200).json({
      message: 'Your hidden gem suggestions retrieved.',
      data: gems
    });
  } catch (error) {
    console.error('getMyGems error:', error);
    return res.status(500).json({ message: 'Failed to retrieve your hidden gems.' });
  }
};

/**
 * PUT /api/hidden-gems/:id/approve
 * Admin only – approves a pending hidden gem.
 */
const approveGem = async (req, res) => {
  try {
    const gemId = parseInt(req.params.id, 10);
    if (isNaN(gemId)) {
      return res.status(400).json({ message: 'Invalid hidden gem ID.' });
    }

    const gems = await db.query(
      "SELECT id FROM hidden_gems WHERE id = ? AND status = 'pending'",
      [gemId]
    );
    if (gems.length === 0) {
      return res.status(404).json({ message: 'Pending hidden gem not found.' });
    }

    await db.query(
      "UPDATE hidden_gems SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [gemId]
    );

    return res.status(200).json({ message: 'Hidden gem approved successfully.' });
  } catch (error) {
    console.error('approveGem error:', error);
    return res.status(500).json({ message: 'Failed to approve hidden gem.' });
  }
};

/**
 * PUT /api/hidden-gems/:id/reject
 * Admin only – rejects a pending hidden gem.
 */
const rejectGem = async (req, res) => {
  try {
    const gemId = parseInt(req.params.id, 10);
    if (isNaN(gemId)) {
      return res.status(400).json({ message: 'Invalid hidden gem ID.' });
    }

    const gems = await db.query(
      "SELECT id FROM hidden_gems WHERE id = ? AND status = 'pending'",
      [gemId]
    );
    if (gems.length === 0) {
      return res.status(404).json({ message: 'Pending hidden gem not found.' });
    }

    await db.query(
      "UPDATE hidden_gems SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [gemId]
    );

    return res.status(200).json({ message: 'Hidden gem rejected.' });
  } catch (error) {
    console.error('rejectGem error:', error);
    return res.status(500).json({ message: 'Failed to reject hidden gem.' });
  }
};

module.exports = {
  getHiddenGems,
  suggestHiddenGem,
  voteHiddenGem,
  getMyGems,
  approveGem,
  rejectGem
};
