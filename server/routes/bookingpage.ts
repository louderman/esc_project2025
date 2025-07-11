import express from 'express';
import { Booking } from '../models/booking';

const router = express.Router();

// POST /api/bookings
router.post('/', (req, res) => {
  const booking: Booking = req.body;

  // Optional: Add validation logic here
  if (!booking.hotelId || !booking.userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulate saving to DB
  console.log('New Booking:', booking);

  // Respond back to frontend
  res.status(201).json({
    message: 'Booking received successfully!',
    booking
  });
});

export default router;
