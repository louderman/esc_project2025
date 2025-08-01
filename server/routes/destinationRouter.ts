import express from 'express';
import {
  getAllDestinations,
  getRandomDestinations,
  searchDestinations,
  searchDestinationsInBounds,
} from '../models/destinationModel';
const router = express.Router();

router.get('/all/', async function (req, res) {
  const dests = await getAllDestinations();
  res.send(dests);
});

/**
 * GET /random?count={count}
 */
router.get('/random', async function (req, res) {
  const countRaw = req.query.count as string;
  const count = parseInt(countRaw);
  if (!countRaw || isNaN(count) || count < 1) {
    return res
      .status(400)
      .json({ error: 'Invalid count parameter. Must be a positive number.' });
  }

  const dests = await getRandomDestinations(count);
  res.send(dests);
});

/**
 * GET /query/{text}?distance={distance}?count={count}
 */
router.get(['/query/:text', '/query/'], async function (req, res) {
  const countRaw = Number(req.query.count);
  const count = isNaN(countRaw) ? 10 : countRaw;
  const distanceRaw = Number(req.query.distance); // Max edit distance
  const distance = isNaN(distanceRaw) ? 2 : distanceRaw;

  const text = req.params.text;
  // console.log(text);
  if (!text) {
    res.status(400).json({ message: 'no query text param given' });
    return;
  }

  const rows = await searchDestinations(text, distance, count);

  res.send(rows);
});

/**
 * GET /query/bounds?minLat={...}&maxLat={...}&minLng={...}&maxLng={...}
 */
router.get(['/bounds'], async function (req, res) {
  const lat1 = parseFloat(req.query.minLat as string);
  const lat2 = parseFloat(req.query.maxLat as string);
  const lng1 = parseFloat(req.query.minLng as string);
  const lng2 = parseFloat(req.query.maxLng as string);
  if (isNaN(lat1) || isNaN(lat2) || isNaN(lng1) || isNaN(lng2)) {
    res.status(400).json({ error: 'Invalid or missing bounds parameters.' });
    return;
  }
  const [minLat, maxLat] = lat1 < lat2 ? [lat1, lat2] : [lat2, lat1];
  const [minLng, maxLng] = lng1 < lng2 ? [lng1, lng2] : [lng2, lng1];
  console.log(minLat, maxLat, minLng, maxLng);
  const destinations = await searchDestinationsInBounds({
    minLat,
    maxLat,
    minLng,
    maxLng,
  });

  res.send(destinations);
});

export { router };