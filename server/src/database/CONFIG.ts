// Database configuration
// Loads settings from environment variables

// Validate DB_SERVICE is set and not empty
import * as process from 'process';
import { Dialect } from 'sequelize';

export const DB_CONFIG = {
  username: process.env.DB_USER || 'tillganglighet',
  password: process.env.DB_PASSWORD || 'tillganglighet',
  databaseName: 'oracle',
  dbCn: process.env.DB_CN || 'tillganglighetdb-utv',
  dialect: 'oracle' as Dialect,
  dbOraclePath: process.env.DB_ORACLE_PATH || 'C:\\Program Files\\instantclient_23_0',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
