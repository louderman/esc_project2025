import express from 'express';
import { pool } from '../database/db'; 
import { all, query, random } from '../models/destination';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const dests = await all();
    res.json(dests);
  } catch (error) {
    console.error('Error fetching all destinations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/debug/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM destinations');
    res.json(rows);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug query failed' });
  }
});

router.get('/random/:count?', async (req, res) => {
  try {
    const countRaw = Number(req.params.count || req.query.count);
    const count = isNaN(countRaw) ? 10 : countRaw;

    if (count === 0) {
      res.json([]);
      return;
    }

    const dests = await random(count);
    res.json(dests);
  } catch (error) {
    console.error('Error fetching random destinations:', error);
    res.status(500).json({ error: 'Failed to get random destinations' });
  }
});

router.get('/query/:text?', async (req, res) => {
  try {
    const countRaw = Number(req.query.count);
    const count = isNaN(countRaw) ? 10 : countRaw;
    const DISTANCE_THRESH = 2;

    const text = req.params.text;
    if (!text) {
      res.json([]);
      return;
    }

    const rows = await query(text, DISTANCE_THRESH, count);
    res.json(rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Export as both named and default
export { router };
export default router;