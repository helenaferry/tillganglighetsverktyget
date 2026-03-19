import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './CONFIG';

import { getConnectionStringFromLDAP } from './getConnectionStringFromLDAP';

import oracledb from 'oracledb';
import { checkIsTransientConnectionError } from './checkWhatTypeOfError';
import { initReview, initCheck } from '../models';

export let sequelizeInstance: Sequelize;

/**
 * Connect to the database with exponential backoff retry logic.
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
  const connectionString = await getConnectionStringFromLDAP();
  sequelizeInstance = new Sequelize({
    dialect: DB_CONFIG.dialect,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
    dialectOptions: {
      connectString: connectionString,
    },
  });

  // Initialize models
  initReview(sequelizeInstance);
  initCheck(sequelizeInstance);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      oracledb.initOracleClient({ libDir: DB_CONFIG.dbOraclePath });
      await sequelizeInstance.authenticate();

      console.log('✅ Database connected successfully.');

      return;
    } catch (error: unknown) {
      const isTransientConnectionError = checkIsTransientConnectionError(error);
      const shouldRetry = isTransientConnectionError && attempt < maxRetries;
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
