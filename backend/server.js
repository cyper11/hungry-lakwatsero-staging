// HungryLakwatsero Backend API Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const db = require('./config/db');
const env = require('./config/env');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const storyController = require('./controllers/storyController');

const app = express();
const PORT = env.PORT;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded images in React client
}));
app.use(cors({
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Standard parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Transform /uploads/... paths to absolute URLs when UPLOAD_BASE_URL is set
app.use((req, res, next) => {
  if (env.UPLOAD_BASE_URL) {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const transformed = JSON.parse(
        JSON.stringify(body, (key, value) => {
          if (typeof value === 'string' && value.startsWith('/uploads/')) {
            return env.UPLOAD_BASE_URL.replace(/\/$/, '') + value;
          }
          return value;
        })
      );
      return originalJson(transformed);
    };
  }
  next();
});

// Root & Health Checks
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API Health
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 */
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    dbEngine: db.getDbType(),
    environment: env.NODE_ENV
  });
});

// Apply global rate limiting to all REST routes
app.use('/api', apiLimiter);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "HungryLakwatsero API Docs"
}));

// Bind Route Handlers
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));

/**
 * @swagger
 * /api/municipalities:
 *   get:
 *     summary: Get all supported municipalities
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: List of municipalities
 */
app.get('/api/municipalities', storyController.getMunicipalities);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/hidden-gems', require('./routes/hiddenGemRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// API 404 Handler
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Graceful shutdown
let server = null;

const shutdown = async (signal) => {
  console.log(`\n[server] ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[server] HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.warn('[server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Initialize DB and Boot Server
async function startServer() {
  try {
    await db.initDb();
    server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` HungryLakwatsero API SERVER RUNNING ON PORT ${PORT}`);
      console.log(` Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(` Database: Active (${db.getDbType()})`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(`=================================================`);
    });

    // Request timeout: 30 seconds to prevent hanging connections
    server.timeout = 30000;

    server.on('timeout', (socket) => {
      console.warn('[server] Request timed out after 30s');
      socket.destroy();
    });
  } catch (error) {
    console.error('[server] Failed to initialize:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
