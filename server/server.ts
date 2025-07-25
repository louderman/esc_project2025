import process from 'process';
import express from 'express';
import cors from 'cors';

import { cleanup } from './database/db';

import { sync as syncUser } from './models/userModel';
import { sync as syncDest } from './models/destinationModel';

import { router as destRouter } from './routes/destinationRoute';
import { router as priceRouter } from './routes/hotelpriceRoute';
import { router as hotelRouter } from './routes/hotelRoute';
import { router as authRouter } from './routes/authRoute';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/destination', destRouter);
app.use('/api/hotel-price', priceRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/auth', authRouter);

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

syncUser();
syncDest();

// process.env.NODE_ENV === 'test' only when we run `npm run test`
if (process.env.NODE_ENV !== 'test') {
  app.listen(5000, () => {
    console.log('Server listening on port 5000.');
  });
}

export default app;
