import dotenv from 'dotenv';
dotenv.config();

import process from 'process';
import express from 'express';
import cors from 'cors';

import { cleanup } from './database/db';

import { sync as syncUser } from './models/userModel';
import { sync as syncDest } from './models/destinationModel';
import { sync as syncBooking } from './models/bookingModel';

import { router as destRouter } from './routes/destinationRouter';
import { router as priceRouter } from './routes/hotelpriceRouter';
import { router as hotelRouter } from './routes/hotelRouter';
import { router as authRouter } from './routes/authRouter';
import { router as paymentRouter } from './routes/payment';
import { router as bookingRouter } from './routes/bookingRouter';
import { router as hotelDetailRouter } from './routes/hoteldetailRouter';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/destination', destRouter);
app.use('/api/hotel-price', priceRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/hotel-detail', hotelDetailRouter);

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

syncUser();
syncDest();
syncBooking();

// Run test only when not in testing mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(5000, () => {
    console.log('Server listening on port 5000.');
  });
}

export default app;
