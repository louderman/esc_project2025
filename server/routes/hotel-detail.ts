import express, { Request, Response } from 'express';
import { PriceResponse } from '../../types/Price';

const router = express.Router();

// Define the error response type for reusability
interface ErrorResponse {
  searchCompleted: boolean | null;
  completed: boolean;
  status: string;
  currency: string | null;
  hotels: any[];
}

// Define the route parameter interface
interface RouteParams {
  dest_id: string;
}

router.get('/query/:dest_id', async (
  req,
  res
) => {
  const { dest_id } = req.params;

  if (!dest_id?.trim()) {
    return res.status(400).json({
      searchCompleted: null,
      completed: true,
      status: 'Missing destination ID',
      currency: null,
      hotels: [],
    });
  }

  const queryParams = new URLSearchParams({
    destination_id: dest_id,
    checkin: '2025-10-01',
    checkout: '2025-10-07',
    lang: 'en_US',
    currency: 'SGD',
    country_code: 'SG',
    guests: '2',
    partner_id: '1',
  });

  const url = `https://hotelapi.loyalty.dev/api/hotels/prices?${queryParams.toString()}`;

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
        searchCompleted: false,
        completed: false,
        status: `Upstream error: ${response.status}`,
        currency: null,
        hotels: [],
      });
    }

    const data: PriceResponse = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('[Hotel Price API Fetch Error]', err);
    return res.status(500).json({
      searchCompleted: false,
      completed: false,
      status: 'Internal server error while fetching hotel prices',
      currency: null,
      hotels: [],
    });
  }
});

export { router };