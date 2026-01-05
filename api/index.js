const serverless = require('serverless-http');
const app = require('../src/app');
// initialize models so Sequelize is configured before handling requests
require('../src/models');

module.exports = serverless(app);
