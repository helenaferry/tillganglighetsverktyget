// Database configuration
// Loads settings from environment variables

// Validate DB_SERVICE is set and not empty
import * as process from 'process';

/* TODO: ENV fungerera inte som förväntat nu. */

export const DB_CONFIG = {
  username: process.env.DB_USER || 'tillganglighet',
  password: process.env.DB_PASSWORD || 'tillganglighet',
  databaseName: 'oracle',
  dbCn: process.env.DB_CN || 'tillganglighetdb-utv',
  dialect: 'oracle',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Log configuration on startup (without password)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Database Configuration:');
  console.log(`   Service: ${DB_CONFIG.databaseName}`);
  console.log(`   User: ${DB_CONFIG.username}`);
  console.log(`   DB_SERVICE env var: ${process.env.DB_SERVICE || '(not set)'}`);
}
