import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import process from 'process';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import net from 'net';
import morgan from 'morgan';
import { cleanup } from './database/db';
import { router as destRouter } from './routes/destination';
import { router as priceRouter } from './routes/hotel-price';
import hotelRouter from './routes/hotel'; // Fixed import
import { sync as syncDest } from './models/destination';

// Configuration
const DEFAULT_PORT = parseInt(process.env.PORT || '5001');
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express
const app = express();

// ======================
// Enhanced Middleware Stack
// ======================

// Request logging with response time
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:']
    }
  } : false,
  hsts: NODE_ENV === 'production' ? {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Enhanced CORS
app.use(cors({
  origin: CORS_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => NODE_ENV === 'test'
});
app.use('/api/', limiter);

// Body Parsing with size limits
app.use(express.json({ 
  limit: '10kb',
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10kb',
  parameterLimit: 10 
}));

// ======================
// Database Initialization
// ======================
syncDest()
  .then(() => console.log('✓ Database synchronized'))
  .catch(err => {
    console.error('✗ Database sync failed:', err);
    process.exit(1);
  });

// ======================
// Route Definitions
// ======================

// API Routes (versioned)
app.use('/api/v1/destinations', destRouter);
app.use('/api/v1/hotel-prices', priceRouter);
app.use('/api/v1/hotels', hotelRouter);

// System Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Hotel API Service',
    version: '1.0.0',
    environment: NODE_ENV,
    documentation: '/api-docs'
  });
});

// ======================
// Enhanced Error Handling
// ======================

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      '/api/v1/hotels',
      '/api/v1/destinations',
      '/health'
    ]
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorId = Date.now(); // Unique ID for error tracking
  
  console.error(`[${new Date().toISOString()}] Error ${errorId}:`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    error: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    status: 'error',
    errorId,
    ...(NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
});

// ======================
// Server Lifecycle Management
// ======================

async function findAvailablePort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen({ port }, () => {
      server.close(() => resolve(port));
    });
  });
}

const startServer = async (): Promise<ReturnType<typeof app.listen>> => {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`
      ==================================
      🚀 Server running in ${NODE_ENV} mode
      🔗 http://localhost:${port}
      🔗 http://127.0.0.1:${port}
      ==================================
      `);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.log(`Attempting to restart on port ${port + 1}...`);
        startServer();
      } else {
        process.exit(1);
      }
    });

    return server;
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
};

const gracefulShutdown = async (server: ReturnType<typeof app.listen>) => {
  console.log('\n🛑 Received shutdown signal');
  
  try {
    await new Promise<void>((resolve, reject) => {
      server.close(async (err) => {
        if (err) return reject(err);
        console.log('🔌 HTTP server closed');
        await cleanup();
        console.log('🧹 Resources cleaned up');
        resolve();
      });
    });
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
};

// Start the application
(async () => {
  try {
    const server = await startServer();
    
    // Handle shutdown signals
    const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'];
    shutdownSignals.forEach(signal => {
      process.on(signal, () => gracefulShutdown(server));
    });
    
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
    });
    
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      gracefulShutdown(server);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
})();

export { app };