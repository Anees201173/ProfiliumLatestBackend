require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  // Support multiple origins via comma-separated list in CORS_ORIGIN
  corsOrigin: (() => {
    const raw = process.env.CORS_ORIGIN || '*';
    if (raw === '*') return '*';
    if (raw.includes(',')) return raw.split(',').map(s => s.trim()).filter(Boolean);
    return raw;
  })(),
};
