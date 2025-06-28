import express from 'express';
import { all, query } from '../models/destination';
const router = express.Router();

router.get('/all/', async function (req, res) {
  const dests = await all();
  res.send(dests);
});

router.get(['/query/:text', '/query/'], async function (req, res) {
  const RETURN_COUNT = 10;
  const DISTANCE_THRESH = 2;

  const text = req.params.text;
  console.log(text);
  if (!text) {
    res.send([]);
    return;
  }

  const rows = await query(text, DISTANCE_THRESH, RETURN_COUNT);

  res.send(rows);
});

export { router };
