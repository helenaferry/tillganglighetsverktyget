import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './CONFIG';

import { getConnectionStringFromLDAP } from './getConnectionStringFromLDAP';
import oracledb from 'oracledb';
import { logDatabaseError } from './databas-log-error';

/*
// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL: DB_PASSWORD environment variable is required in production',
    );
  }
  console.warn(
    '⚠️  WARNING: DB_PASSWORD not set. This is only acceptable in local development.',
  );
}

// Validate that required config values are set
if (
  !DB_CONFIG.databaseName ||
  DB_CONFIG.databaseName === 'Default' ||
  DB_CONFIG.databaseName.trim() === ''
) {
  console.error('❌ Invalid database service name:', DB_CONFIG.databaseName);
  console.error(
    '   DB_SERVICE environment variable:',
    process.env.DB_SERVICE || '(not set)',
  );
  console.error(
    '   DB_HOST environment variable:',
    process.env.DB_HOST || '(not set)',
  );
  console.error('   DB_CONFIG values:', {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    databaseName: DB_CONFIG.databaseName,
    username: DB_CONFIG.username,
  });
  throw new Error(
    `Invalid database service name: "${DB_CONFIG.databaseName}". DB_SERVICE must be set to FREEPDB1`,
  );
}

// Log the actual connectString being used (for debugging)
if (process.env.NODE_ENV === 'development') {
  console.log(
    `🔗 Database connectString: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.databaseName}`,
  );
}
*/

export const sequelize = new Sequelize({
  dialect: DB_CONFIG.dialect,
  username: DB_CONFIG.username,
  password: DB_CONFIG.password,
  dialectOptions: {
    connectString: 'mtstutvscan.arbetsformedlingen.se:1521/utvtillganglighetsrv'
  },
});

/**
 * Connect to the database with exponential backoff retry logic.
 * This handles the case where Oracle init scripts are still running when the backend starts.
 *
 * Uses exponential backoff: delays increase exponentially (1s, 2s, 4s, 8s...) up to a max of 10s.
 * This is a best practice for retrying transient failures in distributed systems.
 *
 * @param maxRetries - Maximum number of retry attempts (default: 30, ~2 minutes total)
 * @param initialDelay - Initial delay in milliseconds (default: 1000ms)
 * @param maxDelay - Maximum delay between retries in milliseconds (default: 10000ms)
 * @param backoffMultiplier - Multiplier for exponential backoff (default: 2)
 */
export const connectDB = async (
  maxRetries = 30,
  initialDelay = 1000,
  maxDelay = 10000,
  backoffMultiplier = 2,
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      //const connectionString = await getConnectionStringFromLDAP()

      oracledb.initOracleClient({ libDir: DB_CONFIG.dbOraclePath});
      await sequelize.authenticate();

      console.log('✅ Database connected successfully.');
      console.log(`   User: ${DB_CONFIG.username}`);
      return;
    } catch (error: any) {
      logDatabaseError(error);
    }
  }
};
