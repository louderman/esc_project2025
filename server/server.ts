import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import process from 'process';

import { cleanup } from './database/db';

import { sync as syncBooking } from './models/bookingModel';
import { sync as syncDest } from './models/destinationModel';
import { sync as syncUser } from './models/userModel';

import { router as authRouter } from './routes/authRouter';
import bookingRouter from './routes/bookingRouter';
import { router as destRouter } from './routes/destinationRouter';
import { router as hotelDetailRouter } from './routes/hoteldetailRouter';
import { router as priceRouter } from './routes/hotelpriceRouter';
import { router as hotelRouter } from './routes/hotelRouter';
import paymentRouter from './routes/payment';

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

// process.env.NODE_ENV === 'test' only when we run `npm run test`
if (process.env.NODE_ENV !== 'test') {
  app.listen(5000, () => {
    console.log('Server listening on port 5000.');
  });
}

export default app;
