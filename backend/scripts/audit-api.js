const { app } = require('../server');
const db = require('../config/db');

const PASSWORD = 'Admin@123!';

async function main() {
  await db.initDb();
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const cleanup = [];
  const results = [];

  const request = async (method, path, { token, body, expected = [200] } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!expected.includes(response.status)) {
      throw new Error(`${method} ${path} returned ${response.status}: ${text}`);
    }
    results.push(`${method} ${path} -> ${response.status}`);
    return data;
  };

  const login = async (email) => {
    const data = await request('POST', '/api/auth/login', {
      body: { email, password: PASSWORD },
      expected: [200]
    });
    return data.accessToken;
  };

  try {
    await request('GET', '/api/health');
    await request('GET', '/api/restaurants');
    await request('GET', '/api/restaurants/1');
    await request('GET', '/api/restaurants/1/menu');
    await request('GET', '/api/reviews?restaurantId=1');
    await request('GET', '/api/stories');
    await request('GET', '/api/municipalities');
    await request('GET', '/api/analytics/public');

    const touristToken = await login('tourist1@demo.com');
    const ownerToken = await login('owner1@demo.com');
    const adminToken = await login('admin@hungrylakwatsero.ph');

    await request('GET', '/api/favorites', { token: touristToken });
    await request('GET', '/api/favorites/check/1', { token: touristToken });
    await request('POST', '/api/favorites/toggle', { token: touristToken, body: { restaurantId: 1 } });
    await request('POST', '/api/favorites/toggle', { token: touristToken, body: { restaurantId: 1 } });
    await request('GET', '/api/reviews/mine', { token: touristToken });

    const unique = Date.now();
    const tempEmail = `audit${unique}@example.com`;
    const register = await request('POST', '/api/auth/register', {
      body: {
        firstName: 'Audit',
        lastName: 'User',
        email: tempEmail,
        password: PASSWORD,
        roleId: 1
      },
      expected: [201]
    });
    cleanup.push(async () => db.query('DELETE FROM users WHERE email = ?', [tempEmail]));
    const tempToken = await login(tempEmail);

    const createReview = await request('POST', '/api/reviews/restaurant/1', {
      token: tempToken,
      body: { content: `Automated backend audit review ${unique}`, ratingValue: 5 },
      expected: [201]
    });
    const reviewId = createReview.reviewId;
    cleanup.push(async () => db.query('DELETE FROM reviews WHERE id = ?', [reviewId]));
    cleanup.push(async () => db.query('DELETE FROM ratings WHERE restaurant_id = ? AND user_id = ?', [1, register.userId]));

    await request('PUT', `/api/reviews/${reviewId}`, {
      token: tempToken,
      body: { content: `Updated automated backend audit review ${unique}`, ratingValue: 4 }
    });
    await request('POST', `/api/reviews/${reviewId}/reply`, {
      token: ownerToken,
      body: { content: 'Thanks for visiting!' },
      expected: [201]
    });
    await request('POST', '/api/reports', {
      token: tempToken,
      body: { entityType: 'review', entityId: reviewId, reason: 'Automated endpoint audit report' },
      expected: [201]
    });
    cleanup.push(async () => db.query('DELETE FROM reports WHERE entity_type = ? AND entity_id = ?', ['review', reviewId]));
    await request('DELETE', `/api/reviews/${reviewId}`, { token: tempToken });

    await request('GET', '/api/restaurants/owner/me', { token: ownerToken });
    await request('GET', '/api/analytics/owner', { token: ownerToken });
    await request('GET', '/api/posts/owner/mine', { token: ownerToken });
    await request('GET', '/api/admin/users', { token: adminToken });
    await request('GET', '/api/admin/verification-requests', { token: adminToken });
    await request('GET', '/api/admin/reports', { token: adminToken });
    await request('GET', '/api/admin/audit-logs', { token: adminToken });
    await request('GET', '/api/admin/reviews', { token: adminToken });
    await request('GET', '/api/admin/municipalities', { token: adminToken });
    await request('GET', '/api/analytics/admin', { token: adminToken });

    console.log(`API audit passed (${results.length} checks)`);
    for (const line of results) console.log(line);
  } finally {
    for (const task of cleanup.reverse()) {
      try {
        await task();
      } catch (error) {
        console.warn('Cleanup warning:', error.message);
      }
    }
    await new Promise((resolve) => server.close(resolve));
    await db.close();
  }
}

main().catch(async (error) => {
  console.error('API audit failed:', error.message);
  try {
    await db.close();
  } catch {}
  process.exit(1);
});
