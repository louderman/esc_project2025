import dotenv from 'dotenv';
dotenv.config();

import process from 'process';
import express from 'express';
import cors from 'cors';

import { cleanup } from './database/db';

import { sync as syncUser } from './models/userModel';
import { sync as syncDest } from './models/destinationModel';

import { router as destRouter } from './routes/destinationRouter';
import { router as priceRouter } from './routes/hotelpriceRouter';
import { router as hotelRouter } from './routes/hotelRouter';
import { router as authRouter } from './routes/authRouter';
import paymentRouter from './routes/payment';

const app = express();

app.use(cors());
app.use(express.json());

// General routes for everyone
app.use('/api/destination', destRouter);
app.use('/api/hotel-price', priceRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);


// Test route for hotel-detail
app.get('/api/hotel-detail/test', (req, res) => {
  res.json({ message: 'Hotel detail route is working!' });
});

// Combined hotel detail and prices route
app.get('/api/hotel-detail/combined/:hotelId', async (req, res) => {
  const { hotelId } = req.params;
  const { 
    destination_id, 
    checkin, 
    checkout, 
    lang = 'en_US', 
    currency = 'SGD', 
    country_code = 'SG', 
    guests = '2', 
    partner_id = '1' 
  } = req.query;

  if (!hotelId?.trim()) {
    return res.status(400).json({
      error: 'Missing hotel ID'
    });
  }

  try {
    const hotelUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}`;
    const pricesUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}/prices?${new URLSearchParams({
      destination_id: destination_id as string,
      checkin: checkin as string,
      checkout: checkout as string,
      lang: lang as string,
      currency: currency as string,
      country_code: country_code as string,
      guests: guests as string,
      partner_id: partner_id as string,
    })}`;

    // Fetch hotel details and prices in parallel
    const [hotelResponse, pricesResponse] = await Promise.all([
      fetch(hotelUrl, { headers: { Accept: 'application/json' } }),
      fetch(pricesUrl, { headers: { Accept: 'application/json' } })
    ]);

    if (!hotelResponse.ok) {
      const hotelErrorText = await hotelResponse.text();
      throw new Error(`Hotel details API error: ${hotelResponse.status} - ${hotelErrorText}`);
    }

    const hotelData = await hotelResponse.json();

    let pricesData = { rooms: [] };
    if (pricesResponse.ok) {
      pricesData = await pricesResponse.json();
    }

    return res.json({
      hotel: hotelData,
      prices: pricesData
    });
  } catch (err) {
    console.error('[Combined Hotel API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel data',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

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
