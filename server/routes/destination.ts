import express from 'express';
import { all, query, random } from '../models/destination';
const router = express.Router();

router.get('/all/', async function (req, res) {
  const dests = await all();
  res.send(dests);
});

/**
 * GET /random?count={count}
 */
router.get('/random', async function (req, res) {
  const countRaw = parseInt(req.query.count as string);
  const count = isNaN(countRaw) ? 10 : countRaw;

  if (count === 0) {
    res.send([]);
    return;
  }

  const dests = await random(count);
  res.send(dests);
});

router.get(['/query/:text', '/query/'], async function (req, res) {
  const countRaw = Number(req.query.count);
  const count = isNaN(countRaw) ? 10 : countRaw;
  const DISTANCE_THRESH = 2; // Max edit distance, expose to client input?

  const text = req.params.text;
  console.log(text);
  if (!text) {
    res.send([]);
    return;
  }

  const rows = await query(text, DISTANCE_THRESH, count);

  res.send(rows);
});

export { router };
