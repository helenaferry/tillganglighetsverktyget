// Database configuration
// Loads settings from environment variables

// Validate DB_SERVICE is set and not empty
const dbService = process.env.DB_SERVICE?.trim();
if (!dbService || dbService === '') {
  console.warn('⚠️  WARNING: DB_SERVICE is not set or empty. Using default: FREEPDB1');
}

export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1521', 10),
  username: process.env.DB_USER || 'tillgang_user',
  password: process.env.DB_PASSWORD as string, // Required - no fallback for security
  databaseName: dbService || 'FREEPDB1',
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
  console.log(`   Host: ${DB_CONFIG.host}`);
  console.log(`   Port: ${DB_CONFIG.port}`);
  console.log(`   Service: ${DB_CONFIG.databaseName}`);
  console.log(`   User: ${DB_CONFIG.username}`);
  console.log(`   DB_SERVICE env var: ${process.env.DB_SERVICE || '(not set)'}`);
}
