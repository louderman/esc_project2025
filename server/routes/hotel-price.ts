import express, { Request, Response } from 'express';
import { PriceResponse } from '../../types/Price';

const router = express.Router();

router.get('/query/:dest_id', async (req: Request, res: Response) => {
  try {
    const dest_id = req.params.dest_id;
    if (!dest_id) {
      return res.status(400).json({ error: 'Destination ID is required' });
    }

    const url = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${dest_id}&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Hotel API error: ${response.statusText}`);
    }

    const data: PriceResponse = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Failed to fetch hotel prices:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch hotel prices',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;