import app from './app';
import { connectDB, sequelize } from './database/database';

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  await sequelize.sync(); // skapar tabeller automatiskt
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
