import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './CONFIG';

export const sequelize = new Sequelize(
  DB_CONFIG.databaseName,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host,
    dialect: DB_CONFIG.dialect as any,
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
