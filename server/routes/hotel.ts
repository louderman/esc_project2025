import express from 'express';
import { Hotel } from '../../types/Hotel';
const router = express.Router();

router.get(['/query', '/query/:dest_id'], async (req, res) => {
  const dest_id = req.params.dest_id;
  if (!dest_id) {
    res.send([]);
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
