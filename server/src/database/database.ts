import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './CONFIG';

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: DB_PASSWORD environment variable is required in production');
  }
  console.warn('⚠️  WARNING: DB_PASSWORD not set. This is only acceptable in local development.');
}

// Initialize Sequelize for Oracle database
export const sequelize = new Sequelize({
  dialect: 'oracle',
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  username: DB_CONFIG.username,
  password: DB_CONFIG.password,
  database: DB_CONFIG.databaseName,
  pool: DB_CONFIG.pool,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    connectString: `${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.databaseName}`,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    console.log(`   Connected to: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.databaseName}`);
    console.log(`   User: ${DB_CONFIG.username}`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};
