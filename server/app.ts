import express, { Request, Response } from 'express';
import cors from 'cors';

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

export default app;
