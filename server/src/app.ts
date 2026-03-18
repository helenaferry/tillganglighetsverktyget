import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import reviewRoutes from './routes/reviewRoutes';
import requirementRoutes from './routes/requirementRoutes';
import { sequelizeInstance } from './database/database';
import { requestContextMiddleware } from './middleware/requestContext';
import logger from './logger';

const app = express();

// Configure CORS based on environment
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request context middleware (extracts user, IP, generates request ID)
app.use(requestContextMiddleware);

// Health check endpoint with database connectivity check
app.get('/health', async (req, res) => {
  try {
    // Check database connection with a simple query
    await sequelizeInstance.query('SELECT 1 FROM DUAL');
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed - database unreachable', { error });
    res.status(503).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: 'Database is not reachable'
    });
  }
});

// API routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/requirements', requirementRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ 
    error: 'Internal server error',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
