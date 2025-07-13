import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import destRouter from './routes/destination';  // Correct path
import priceRouter from './routes/hotel-price'; // Correct path
import hotelRouter from './routes/hotel';       // Correct path

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/v1/destinations', destRouter);
app.use('/api/v1/hotel-prices', priceRouter);
app.use('/api/v1/hotels', hotelRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});