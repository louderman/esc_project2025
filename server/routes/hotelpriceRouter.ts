import express from 'express';
import { PriceResponse } from '../../types/Price';
import fs from 'fs';
import path from 'path';
const router = express.Router();

/**
 * GET /query?dest_id={dest_id}&checkin={checkin}&checkout={checkout}&guests={guests}
 */
router.get('/query', async (req, res) => {
  const { dest_id, checkin, checkout, guests } = req.query;
  if (!dest_id || !checkin || !checkout || !guests) {
    res.status(400).json({ error: 'Missing one of the required parameters.' });
    return;
  }

  const checkinDate = new Date(checkin as string);
  const checkoutDate = new Date(checkout as string);
  const guestCount = parseInt(guests as string);

  if (
    isNaN(checkinDate.getTime()) ||
    isNaN(checkoutDate.getTime()) ||
    isNaN(guestCount)
  ) {
    return res.status(400).json({ error: 'Invalid date or guest count' });
  }

  const url = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${dest_id}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guestCount}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;
  // console.log(url);
  // const url = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${dest_id}&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);
      // Fallback to mock data when external API fails
      const mockDataPath = path.join(__dirname, '../public/mockHotelData.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      res.send(mockData.prices);
      return;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('External API returned non-JSON response:', contentType);
      // Fallback to mock data when external API fails
      const mockDataPath = path.join(__dirname, '../public/mockHotelData.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      res.send(mockData.prices);
      return;
    }
    
    const data: PriceResponse = await response.json();
    // console.log(data);

    res.send(data);
  } catch (error) {
    console.error('Error fetching price data:', error);
    // Fallback to mock data when external API fails
    try {
      const mockDataPath = path.join(__dirname, '../public/mockHotelData.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      res.send(mockData.prices);
    } catch (mockError) {
      res.status(500).json({ error: 'Failed to fetch price data and no mock data available' });
    }
  }
});

export { router };