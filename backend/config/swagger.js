const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HungryLakwatsero API',
      version: '1.0.0',
      description: 'API documentation for the HungryLakwatsero Cavite Culinary Tourism Platform backend.',
      contact: {
        name: 'API Support',
        email: 'support@hungrylakwatsero.ph'
      }
    },
    servers: [
      {
        url: env.API_BASE_URL,
        description: env.isProd ? 'Production Server' : 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../server.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
