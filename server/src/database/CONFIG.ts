// Database configuration
// Loads settings from environment variables

// Validate DB_SERVICE is set and not empty
import * as process from 'process';
import { Dialect } from 'sequelize';

export const DB_CONFIG = {
  username: process.env.DB_USER || 'tillganglighet',
  password: process.env.DB_PASSWORD || 'tillganglighet',
  databaseName: 'oracle',
  dbServiceName: process.env.DB_SERVICE_NAME || 'tillganglighetdb-utv',
  dialect: 'oracle' as Dialect,
  dbOraclePath: process.env.DB_ORACLE_PATH || 'C:\\Program Files\\instantclient_23_0',
  ldapUrl: process.env.LDAP_URL || 'ldap://afkatalog-acc.arbetsformedlingen.se:389',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
