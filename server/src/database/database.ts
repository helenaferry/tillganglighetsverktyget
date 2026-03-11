import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './CONFIG';

import { getConnectionStringFromLDAP } from './getConnectionStringFromLDAP';

import oracledb from 'oracledb';
import {
  checkIsDatabaseNotOpen, checkIsDefaultServiceError,
  checkIsServiceNotRegistered,
  checkIsTransientConnectionError,
} from './checkWhatTypeOfError';

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


      const isTransientConnectionError = checkIsTransientConnectionError(error);

      const isServiceNotRegistered = checkIsServiceNotRegistered(error);


      if (isServiceNotRegistered) {
        console.log(
          `⏳ FREEPDB1 not registered with listener yet (attempt ${attempt}/${maxRetries})`,
        );
        console.log(
          `   This is normal during Oracle initialization. Waiting for listener to register FREEPDB1...`,
        );
        console.log(
          `   The IP address shown (e.g., 10.89.0.2) is the internal container network IP - this is correct.`,
        );
      }

      const isDatabaseNotOpen = checkIsDatabaseNotOpen(error);

      if (isDatabaseNotOpen) {
        console.log(
          `⏳ Database not open yet (attempt ${attempt}/${maxRetries})`,
        );
        console.log(
          `   Waiting for FREEPDB1 to open and init scripts to complete...`,
        );
      }

      // Check for "Service Default" error - indicates DB_SERVICE not set correctly
      const isDefaultServiceError = checkIsDefaultServiceError(error);
      if (isDefaultServiceError) {
        console.error('❌ Configuration error: Service name is "Default"');
        console.error('This usually means DB_SERVICE environment variable is not set correctly',);
        console.error('Current DB_CONFIG.databaseName:', DB_CONFIG.databaseName);
        console.error('process.env.DB_SERVICE:', process.env.DB_SERVICE || '(not set)');
        console.error('Expected: FREEPDB1');
        console.error('Check that DB_SERVICE=FREEPDB1 is set in compose.dev.yml or .env');
        throw new Error(
          'Database service name is "Default". Set DB_SERVICE=FREEPDB1 in environment variables.',
        );
      }

      const shouldRetry = (isTransientConnectionError) && attempt < maxRetries;
      if (shouldRetry) {
        // Calculate exponential backoff delay with jitter
        const exponentialDelay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay,
        );
        // Add small random jitter (±10%) to prevent thundering herd
        const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
        const delay = Math.floor(exponentialDelay + jitter);

        console.log(
          `⏳ Database not ready yet (attempt ${attempt}/${maxRetries}). ` +
          `Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or max retries reached
      console.error('❌ Unable to connect to the database:', error);
      if (attempt >= maxRetries) {
        console.error(
          `   Failed after ${maxRetries} attempts. Check that Oracle is running and init scripts completed.`,
        );
      }
      throw error;
    }
  }
};
