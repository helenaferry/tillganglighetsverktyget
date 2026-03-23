// @ts-nocheck

import { sequelizeInstance } from './database';
import '../models/Review';
import '../models/Check';
import oracledb from 'oracledb';
import { DB_CONFIG } from './CONFIG';
import { getConnectionStringFromLDAP } from './getConnectionStringFromLDAP';
import { Sequelize } from 'sequelize';
import { initCheck, initReview } from '../models';

async function setupDatabase() {
  const connectionString = await getConnectionStringFromLDAP();
  const sequelizeInstance = new Sequelize({
    dialect: DB_CONFIG.dialect,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password,
    dialectOptions: {
      connectString: connectionString,
    },
  });

  try {

    console.log('Connecting to database...');
    oracledb.initOracleClient({ libDir: DB_CONFIG.dbOraclePath });
    await sequelizeInstance.authenticate();

    console.log('Connected successfully. Creating database schema...');

    console.log('Creating tables using Sequelize models...');
    initReview(sequelizeInstance);
    initCheck(sequelizeInstance);

    await sequelizeInstance.sync({ alter: false });
    console.log('✓ All tables created successfully');

    // Verify tables were created
    const dialect = sequelizeInstance.getDialect();
    let verifyQuery: string;

    if (dialect === 'oracle') {
      verifyQuery = `SELECT COUNT(*) as count FROM user_tables WHERE table_name IN ('REVIEWS', 'CHECKS')`;
    } else if (dialect === 'postgres') {
      verifyQuery = `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('reviews', 'checks')`;
    } else if (dialect === 'mysql' || dialect === 'mariadb') {
      verifyQuery = `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('reviews', 'checks')`;
    } else {
      console.log('Skipping verification for dialect:', dialect);
      return;
    }

    const [results] = await sequelizeInstance.query(verifyQuery);
    const tablesCount = (results[0] as unknown)?.count || 0;

    if (tablesCount < 2) {
      console.warn(`WARNING: Expected 2 tables, but found ${tablesCount}`);
    } else {
      console.log(`Verification: ${tablesCount} tables found in database`);
    }
  } catch (error) {
    console.error('ERROR:', error);
    throw error;
  } finally {
    await sequelizeInstance.close();
  }
}

setupDatabase();
