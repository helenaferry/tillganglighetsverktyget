import app from './app';
import { connectDB } from './database/database';
import * as os from 'os';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Import models to ensure associations are registered
    await import('./models');

    const hostname = !process.env.NODE_ENV || process.env.NODE_ENV ===  'development' ? 'https://localhost' :  os.hostname();
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: ${hostname}:${PORT}/health`);
      console.log(`   API endpoint: ${hostname}:${PORT}/api/reviews`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
