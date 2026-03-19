export const checkIsTransientConnectionError = (error: any): boolean => {
  // Check if this is a transient connection error that should be retried.
  // These are network-level errors relevant for external database connections.
  return (
    error?.code === 'NJS-503' ||
    error?.parent?.code === 'NJS-503' ||
    error?.original?.code === 'NJS-503' ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.parent?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ENOTFOUND') ||
    error?.parent?.message?.includes('ENOTFOUND')
  );
}