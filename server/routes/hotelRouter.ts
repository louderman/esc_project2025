import express from 'express';
import { Hotel } from '../../types/Hotel';
import fs from 'fs';
import path from 'path';
const router = express.Router();

/**
 * GET /query?dest_id={dest_id}
 */
router.get('/query', async (req, res) => {
  const dest_id = req.query.dest_id;
  if (!dest_id) {
    res.status(400).json({ error: 'missing dest_id' });
    return;
  }

  const url = `https://hotelapi.loyalty.dev/api/hotels?destination_id=${dest_id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);
      // Fallback to mock data when external API fails
      const mockDataPath = path.join(__dirname, '../public/mockHotelData.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      res.send(mockData.hotels);
      return;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('External API returned non-JSON response:', contentType);
      // Fallback to mock data when external API fails
      const mockDataPath = path.join(__dirname, '../public/mockHotelData.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      res.send(mockData.hotels);
      return;
    }
    
    const data: Hotel[] = await response.json();
    // console.log(data);
    // console.log('called');

    res.send(data);
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    // Fallback to mock data when external API fails
    try {
      const mockDataPath = path.join(__dirname, '../public/mockHotelData.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      res.send(mockData.hotels);
    } catch (mockError) {
      res.status(500).json({ error: 'Failed to fetch hotel data and no mock data available' });
    }
  }
});

export { router };