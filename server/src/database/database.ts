import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './CONFIG';

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

// Initialize Sequelize for Oracle database
// For Oracle, we use connectString in dialectOptions as the primary connection method
// The database field is kept for compatibility but connectString takes precedence
export const sequelize = new Sequelize({
  dialect: 'oracle',
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  username: DB_CONFIG.username,
  password: DB_CONFIG.password,
  database: DB_CONFIG.databaseName, // Used as fallback, but connectString takes precedence
  pool: DB_CONFIG.pool,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    // Use Easy Connect format: host:port/service_name
    // This is the recommended way for Oracle connections
    connectString: `${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.databaseName}`,
  },
});

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
      await sequelize.authenticate();
      console.log('✅ Database connected successfully.');
      console.log(
        `   Connected to: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.databaseName}`,
      );
      console.log(`   User: ${DB_CONFIG.username}`);
      return;
    } catch (error: any) {
      // Check if this is a transient connection error that should be retried
      // ORA-12514: Service not registered with listener - FREEPDB1 might not be ready yet
      // ORA-01109: Database not open - PDB not fully open when we tried to connect
      const isTransientConnectionError =
        error?.code === 'NJS-503' ||
        error?.parent?.code === 'NJS-503' ||
        error?.original?.code === 'NJS-503' ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.parent?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('ENOTFOUND') ||
        error?.parent?.message?.includes('ENOTFOUND') ||
        error?.message?.includes('ORA-12514') ||
        error?.parent?.message?.includes('ORA-12514') ||
        error?.original?.message?.includes('ORA-12514') ||
        error?.message?.includes('ORA-01109') ||
        error?.parent?.message?.includes('ORA-01109') ||
        error?.original?.message?.includes('ORA-01109') ||
        error?.message?.includes('not registered with the listener') ||
        error?.parent?.message?.includes('not registered with the listener') ||
        error?.original?.message?.includes(
          'not registered with the listener',
        ) ||
        error?.message?.includes('database not open') ||
        error?.parent?.message?.includes('database not open') ||
        error?.original?.message?.includes('database not open');

      // Log specific ORA-12514 errors for better debugging
      // This error means FREEPDB1 exists but listener hasn't registered it yet
      const isServiceNotRegistered =
        error?.message?.includes('ORA-12514') ||
        error?.parent?.message?.includes('ORA-12514') ||
        error?.original?.message?.includes('ORA-12514') ||
        error?.message?.includes('not registered with the listener') ||
        error?.parent?.message?.includes('not registered with the listener') ||
        error?.original?.message?.includes('not registered with the listener');

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

      const isDatabaseNotOpen =
        error?.message?.includes('ORA-01109') ||
        error?.parent?.message?.includes('ORA-01109') ||
        error?.original?.message?.includes('ORA-01109');
      if (isDatabaseNotOpen) {
        console.log(
          `⏳ Database not open yet (attempt ${attempt}/${maxRetries})`,
        );
        console.log(
          `   Waiting for FREEPDB1 to open and init scripts to complete...`,
        );
      }

      // Check for "Service Default" error - indicates DB_SERVICE not set correctly
      const isDefaultServiceError =
        error?.message?.includes('Service Default') ||
        error?.parent?.message?.includes('Service Default') ||
        error?.original?.message?.includes('Service Default');

      if (isDefaultServiceError) {
        console.error('❌ Configuration error: Service name is "Default"');
        console.error(
          '   This usually means DB_SERVICE environment variable is not set correctly',
        );
        console.error(
          '   Current DB_CONFIG.databaseName:',
          DB_CONFIG.databaseName,
        );
        console.error(
          '   process.env.DB_SERVICE:',
          process.env.DB_SERVICE || '(not set)',
        );
        console.error('   Expected: FREEPDB1');
        console.error(
          '   Check that DB_SERVICE=FREEPDB1 is set in compose.dev.yml or .env',
        );
        throw new Error(
          'Database service name is "Default". Set DB_SERVICE=FREEPDB1 in environment variables.',
        );
      }

      // ORA-01017 can be transient: init script may not have run yet (user not created/altered)
      // Retry so we wait for 000-create-user.sh to complete; after maxRetries we still fail (wrong credentials)
      const isOra01017 =
        error?.message?.includes('ORA-01017') ||
        error?.parent?.message?.includes('ORA-01017') ||
        error?.original?.message?.includes('ORA-01017');
      if (isOra01017 && attempt < maxRetries) {
        console.log(
          `⏳ ORA-01017 (attempt ${attempt}/${maxRetries}) - user may not be ready yet; waiting for init script to complete...`,
        );
      } else if (isOra01017 && attempt >= maxRetries) {
        console.error(
          '❌ Authentication failed after retries - check database credentials (DB_PASSWORD, DB_USER)',
        );
        throw error;
      }

      const shouldRetry =
        (isTransientConnectionError || isOra01017) && attempt < maxRetries;
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
