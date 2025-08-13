import express from 'express';
import { getBookingHistory } from '../models/bookingHistoryModel';
const router = express.Router();

//get booking history for specific userId
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    if (userId === 'null' || userId === 'undefined') {
      return res.status(200).json([]);
    }

    const bookings = await getBookingHistory(userId);
    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


export { router };