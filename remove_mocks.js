const fs = require('fs');
const path = require('path');

const dashboards = [
  'AdminDashboard.jsx',
  'OwnerDashboard.jsx',
  'TouristDashboard.jsx'
];

dashboards.forEach(dashboard => {
  const file = path.join('C:\\Users\\karen\\.gemini\\antigravity\\scratch\\hungry-lakwatsero\\hungrylakwatsero\\src\\pages', dashboard);
  let content = fs.readFileSync(file, 'utf8');

  // Strip mock constant declarations
  content = content.replace(/\/\/\s*\s*Mock Data[\s\S]*?\/\/\s*\s*Helpers/i, '//  Helpers');
  
  if (dashboard === 'AdminDashboard.jsx') {
    content = content.replace(/useState\(MOCK_STATS\)/g, "useState({totalUsers: 0, totalRestaurants: 0, pendingApprovals: 0, totalReviews: 0, reportsToResolve: 0, totalStories: 0})");
    content = content.replace(/useState\(MOCK_USERS\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_PENDING\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_APPROVED\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_REPORTS\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_STORIES\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_AUDIT_LOGS\)/g, "useState([])");
    content = content.replace(/console\.warn\('Failed to query administrative APIs[^)]*\);/g, "console.error('Failed to query administrative APIs', err);");
    
    // Also remove fallback logic in AdminDashboard tab fetchers
    content = content.replace(/setReviews\(res\.data\);\s*\} catch \(err\) \{\s*\/\/ Fallback mockup\s*console\.warn\('Failed to fetch reviews[^)]+\);\s*setReviews\(\[\s*\{[^]*?\]\);/g, "setReviews(res.data); } catch (err) { console.error(err); setReviews([]);");
  }

  if (dashboard === 'OwnerDashboard.jsx') {
    content = content.replace(/useState\(MOCK_PROMOTIONS\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_MENU\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_REVIEWS\)/g, "useState([])");
    content = content.replace(/useState\(MOCK_PHOTOS\)/g, "useState([])");
    
    content = content.replace(/restRes\.status === 'fulfilled' \? restRes\.value\.data : MOCK_RESTAURANT/g, "restRes.status === 'fulfilled' ? restRes.value.data : null");
    content = content.replace(/postsRes\.status === 'fulfilled' && Array\.isArray\(postsRes\.value\.data\) \? postsRes\.value\.data : MOCK_POSTS/g, "postsRes.status === 'fulfilled' ? postsRes.value.data : []");
    content = content.replace(/catch \{ setRestaurant\(MOCK_RESTAURANT\); setPosts\(MOCK_POSTS\); \}/g, "catch(err) { console.error('Error fetching dashboard', err); }");
  }

  if (dashboard === 'TouristDashboard.jsx') {
    content = content.replace(/feedRes\.status === 'fulfilled' && Array\.isArray\(feedRes\.value\.data\) \?\s*feedRes\.value\.data\s*: MOCK_FEED_POSTS/g, "feedRes.status === 'fulfilled' ? feedRes.value.data : []");
    content = content.replace(/catch \{\s*setFeedPosts\(MOCK_FEED_POSTS\);\s*\}/g, "catch (err) { console.error('Failed to fetch feed', err); }");

    content = content.replace(/catch \(err\) \{\s*console\.warn\('Dashboard data fetch failed — using mock data.', err\);\s*setFavorites\(MOCK_FAVORITES\);\s*setReviews\(MOCK_REVIEWS\);\s*setHiddenGems\(MOCK_HIDDEN_GEMS\);\s*setFeedPosts\(MOCK_FEED_POSTS\);\s*setTrendingDishes\(MOCK_TRENDING\);\s*setFeaturedRests\(MOCK_FAVORITES\);\s*\}/g, "catch (err) { console.error('Dashboard data fetch failed.', err); }");

    content = content.replace(/:\s*MOCK_FAVORITES/g, ": []");
    content = content.replace(/:\s*MOCK_REVIEWS/g, ": []");
    content = content.replace(/:\s*MOCK_HIDDEN_GEMS/g, ": []");
    content = content.replace(/:\s*MOCK_TRENDING/g, ": []");

    content = content.replace(/axios\.get\('\/api\/feed\?type=tourist'\)/g, "axios.get('/api/posts')");
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Processed ${dashboard}`);
});
