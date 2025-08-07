import express from 'express';
import { updateBooking } from '../models/bookingModel';

const router = express.Router();

// Confirm payment (client-side payment processing completed)
router.post('/confirm-payment', async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing booking ID' });
  }

  if (!paymentIntentId) {
    return res.status(400).json({ error: 'Missing payment intent ID' });
  }

  try {
    // Update booking status to confirmed
    await updateBooking(bookingId, paymentIntentId, 'confirmed');
    
    res.json({ 
      success: true, 
      booking_id: bookingId,
      message: 'Payment confirmed and booking updated successfully'
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({ 
      error: 'Failed to confirm payment and update booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
