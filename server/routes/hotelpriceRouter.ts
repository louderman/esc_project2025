import express from 'express';
import { PriceResponse } from '../../types/Price';
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

  const response = await fetch(url);
  const data: PriceResponse = await response.json();
  // console.log(data);

  res.send(data);
});

export { router };