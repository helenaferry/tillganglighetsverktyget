export const checkIsTransientConnectionError = (error:any):boolean => {
  // Check if this is a transient connection error that should be retried
  // ORA-12514: Service not registered with listener - FREEPDB1 might not be ready yet
  // ORA-01109: Database not open - PDB not fully open when we tried to connect

return error?.code === 'NJS-503' ||
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
}

export const checkIsServiceNotRegistered = (error: any):boolean => {
  // Log specific ORA-12514 errors for better debugging
  // This error means FREEPDB1 exists but listener hasn't registered it yet
  return error?.message?.includes('ORA-12514') ||
    error?.parent?.message?.includes('ORA-12514') ||
    error?.original?.message?.includes('ORA-12514') ||
    error?.message?.includes('not registered with the listener') ||
    error?.parent?.message?.includes('not registered with the listener') ||
    error?.original?.message?.includes('not registered with the listener');
}

export const checkIsDatabaseNotOpen = (error: any):boolean => {
  return  error?.message?.includes('ORA-01109') ||
    error?.parent?.message?.includes('ORA-01109') ||
    error?.original?.message?.includes('ORA-01109');
}

export const checkIsDefaultServiceError = (error:any):boolean => {
  return error?.message?.includes('Service Default') ||
    error?.parent?.message?.includes('Service Default') ||
    error?.original?.message?.includes('Service Default');
}