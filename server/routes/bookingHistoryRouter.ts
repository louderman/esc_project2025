import express from 'express';
import { getBookingHistory } from '../models/bookingHistoryModel';
const router = express.Router();

//get booking history for specific userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await getBookingHistory(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


export { router };