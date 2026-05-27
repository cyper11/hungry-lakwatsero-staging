// Analytics Controller
const db = require('../config/db');

const getPublicStats = async (req, res) => {
  try {
    const municipalitiesCount = await db.query('SELECT COUNT(*) as count FROM municipalities');
    const restaurantsCount = await db.query('SELECT COUNT(*) as count FROM restaurants WHERE status = \'approved\'');
    const reviewsCount = await db.query('SELECT COUNT(*) as count FROM reviews');
    const storiesCount = await db.query('SELECT COUNT(*) as count FROM food_stories WHERE status = \'published\'');

    res.json({
      municipalities: municipalitiesCount[0].count,
      restaurants: restaurantsCount[0].count,
      reviews: reviewsCount[0].count,
      stories: storiesCount[0].count
    });
  } catch (error) {
    console.error('getPublicStats error:', error);
    res.status(500).json({ message: 'Failed to retrieve stats.' });
  }
};

const getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch owner restaurant ID
    const restaurants = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [ownerId]);
    if (restaurants.length === 0) {
      return res.json({
        hasRestaurant: false,
        totalReviews: 0,
        averageRating: 0,
        menuItemsCount: 0,
        profileViews: 0
      });
    }

    const restaurantId = restaurants[0].id;

    const reviewsCount = await db.query('SELECT COUNT(*) as count FROM reviews WHERE restaurant_id = ?', [restaurantId]);
    const ratingAvg = await db.query('SELECT COALESCE(AVG(score), 0) as avg FROM ratings WHERE restaurant_id = ?', [restaurantId]);
    const itemsCount = await db.query('SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = ?', [restaurantId]);

    res.json({
      hasRestaurant: true,
      restaurantId,
      totalReviews: reviewsCount[0].count,
      reviews: reviewsCount[0].count,
      averageRating: parseFloat(Number(ratingAvg[0].avg).toFixed(1)),
      avgRating: parseFloat(Number(ratingAvg[0].avg).toFixed(1)),
      menuItemsCount: itemsCount[0].count
    });
  } catch (error) {
    console.error('getOwnerStats error:', error);
    res.status(500).json({ message: 'Failed to retrieve business analytics.' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) as count FROM users');
    const restaurantsCount = await db.query('SELECT COUNT(*) as count FROM restaurants');
    const pendingVerifications = await db.query('SELECT COUNT(*) as count FROM verification_requests WHERE status = \'pending\'');
    const activeReports = await db.query('SELECT COUNT(*) as count FROM reports WHERE status = \'pending\'');
    const totalReviews = await db.query('SELECT COUNT(*) as count FROM reviews');
    const totalStories = await db.query('SELECT COUNT(*) as count FROM food_stories');

    res.json({
      totalUsers: usersCount[0].count,
      totalRestaurants: restaurantsCount[0].count,
      pendingVerifications: pendingVerifications[0].count,
      pendingApprovals: pendingVerifications[0].count,
      activeReports: activeReports[0].count,
      reportsToResolve: activeReports[0].count,
      totalReviews: totalReviews[0].count,
      totalStories: totalStories[0].count
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: 'Failed to retrieve administrative statistics.' });
  }
};

const getTrendingStats = async (req, res) => {
  try {
    res.json({
      trendingRestaurants: [],
      trendingTags: [],
      topMunicipalities: []
    });
  } catch (error) {
    console.error('getTrendingStats error:', error);
    res.status(500).json({ message: 'Failed to retrieve trending stats.' });
  }
};

module.exports = {
  getPublicStats,
  getOwnerStats,
  getAdminStats,
  getTrendingStats
};
