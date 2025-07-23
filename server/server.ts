import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import process from 'process';
import { cleanup } from './database/db';

import { router as authRouter } from './routes/auth';
import { router as destRouter } from './routes/destination';
import { router as hotelRouter } from './routes/hotel';
import { router as priceRouter } from './routes/hotel-price';
import paymentRouter from './routes/payment';

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
app.use('/api/payment', paymentRouter);

app.listen(5000, () => {
  console.log('Server listening on port 5000.');
});
