import { DB_CONFIG } from './CONFIG';

export const logDatabaseError(error: any) =>{
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