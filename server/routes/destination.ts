import express, { Request, Response } from 'express';
import { all } from '../models/destination';
const router = express.Router();

router.get('/all/', async function (req, res) {
  const dests = await all();
  res.send(dests);
});

export { router };
