import process from 'process';
import express from 'express';
import cors from 'cors';

import { cleanup } from './database/db';

import { sync as syncDest } from './models/destination';
import { sync as syncUser } from './models/userModel';

import { router as destRouter } from './routes/destination';
import { router as priceRouter } from './routes/hotel-price';
import { router as hotelRouter } from './routes/hotel';
import { router as authRouter } from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/destination', destRouter);
app.use('/api/hotel-price', priceRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/auth', authRouter);

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  syncDest();
  syncUser();

  app.listen(5000, () => {
    console.log('Server listening on port 5000.');
  });
}

export default app;
