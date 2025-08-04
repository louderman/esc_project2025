import express, { Request, Response } from 'express';
import { PriceResponse } from '../../types/Price';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Hotel detail router is working', timestamp: new Date().toISOString() });
});

// Define the error response type for reusability
interface ErrorResponse {
  searchCompleted: boolean | null;
  completed: boolean;
  status: string;
  currency: string | null;
  hotels: any[];
}

// Route to get hotel details by ID
router.get('/hotel/:hotelId', async (req, res) => {
  const { hotelId } = req.params;

  if (!hotelId?.trim()) {
    return res.status(400).json({
      error: 'Missing hotel ID'
    });
  }

  const url = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Hotel Detail API Error] ${response.status}: ${text}`);
      return res.status(response.status).json({
        error: `Upstream error: ${response.status}`
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('[Hotel Detail API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel details'
    });
  }
});

// Route to get hotel prices by ID
router.get('/hotel/:hotelId/prices', async (req, res) => {
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

  if (!destination_id || !checkin || !checkout) {
    return res.status(400).json({
      error: 'Missing required parameters: destination_id, checkin, checkout'
    });
  }

  const queryParams = new URLSearchParams({
    destination_id: destination_id as string,
    checkin: checkin as string,
    checkout: checkout as string,
    lang: lang as string,
    currency: currency as string,
    country_code: country_code as string,
    guests: guests as string,
    partner_id: partner_id as string,
  });

  const url = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}/prices?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Hotel Price API Error] ${response.status}: ${text}`);
      return res.status(response.status).json({
        error: `Upstream error: ${response.status}`
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('[Hotel Price API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel prices'
    });
  }
});

// Combined route to get both hotel details and prices
router.get('/combined/:hotelId', async (req, res) => {
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
    // Fetch hotel details (like hotel router)
    const hotelUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}`;
    const hotelResponse = await fetch(hotelUrl);
    const hotelData = await hotelResponse.json();

    // Fetch prices (like hotel price router)
    const priceUrl = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=${lang}&currency=${currency}&country_code=${country_code}&guests=${guests}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;
    const priceResponse = await fetch(priceUrl);
    const pricesData = await priceResponse.json();

    return res.json({
      hotel: hotelData,
      prices: pricesData
    });
  } catch (err) {
    console.error('[Combined Hotel API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel data'
    });
  }
});

export { router };