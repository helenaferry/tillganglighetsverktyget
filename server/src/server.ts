import app from './app';
import { connectDB } from './database/database';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Import models to ensure associations are registered
    await import('./models');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   API endpoint: http://localhost:${PORT}/api/reviews`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
