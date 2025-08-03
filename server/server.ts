import express, { Request, Response } from 'express';
import cors from 'cors';
import process from 'process';
import { cleanup } from './database/db';

import { router as destRouter } from './routes/destination';
import { router as priceRouter } from './routes/hotel-price';
import { router as hotelRouter } from './routes/hotel';
import { router as authRouter } from './routes/auth';

import { sync as syncDest } from './models/destination';
import { sync as syncUser } from './models/userModel';

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

syncDest();
syncUser();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/destination', destRouter);
app.use('/api/hotel-price', priceRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/auth', authRouter);

app.listen(5000, () => {
  console.log('Server listening on port 5000.');
});
