// Database configuration
// Loads settings from environment variables

export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1521', 10),
  username: process.env.DB_USER || 'tillgang_user',
  password: process.env.DB_PASSWORD as string, // Required - no fallback for security
  databaseName: process.env.DB_SERVICE || 'XEPDB1',
  dialect: 'oracle',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
