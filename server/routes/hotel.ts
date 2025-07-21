import express from 'express';
import { Hotel } from '../../types/Hotel';
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

  const response = await fetch(url);
  const data: Hotel[] = await response.json();
  // console.log(data);
  console.log('called');

  res.send(data);
});

export { router };