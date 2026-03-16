import { sequelize } from './database';
import '../models/Review';
import '../models/Check';

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully. Creating database schema...');

    console.log('Creating tables using Sequelize models...');
    await sequelize.sync({ alter: false });
    console.log('✓ All tables created successfully');

    console.log('Schema creation completed successfully');

    // Verify tables were created
    const dialect = sequelize.getDialect();
    let verifyQuery: string;

    if (dialect === 'oracle') {
      verifyQuery = `SELECT COUNT(*) as count FROM user_tables WHERE table_name IN ('reviews', 'checks')`;
    } else if (dialect === 'postgres') {
      verifyQuery = `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('reviews', 'checks')`;
    } else if (dialect === 'mysql' || dialect === 'mariadb') {
      verifyQuery = `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('reviews', 'checks')`;
    } else {
      console.log('Skipping verification for dialect:', dialect);
      return;
    }

    const [results] = await sequelize.query(verifyQuery);
    const tablesCount = (results[0] as any)?.count || 0;

    if (tablesCount < 2) {
      console.warn(`WARNING: Expected 2 tables, but found ${tablesCount}`);
    } else {
      console.log(`Verification: ${tablesCount} tables found in database`);
    }
  } catch (error) {
    console.error('ERROR:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
