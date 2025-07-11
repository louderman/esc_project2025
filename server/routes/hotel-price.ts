import express from 'express';
import { PriceResponse } from '../../types/Price';
const router = express.Router();

router.get('/query/:dest_id', async (req, res) => {
  const dest_id = req.params.dest_id;
  if (!dest_id) {
    res.send([]);
    return;
  }

  const url = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${dest_id}&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1`;

  const response = await fetch(url);
  const data: PriceResponse = await response.json();
  // console.log(data);

  res.send(data);
});

export { router };
