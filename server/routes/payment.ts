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

// Confirm payment and update booking status
router.post('/confirm-payment', async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;

  // Validate required fields
  if (!bookingId || bookingId.trim() === '') {
    return res.status(400).json({ error: 'Missing booking ID' });
  }

  if (!paymentIntentId || paymentIntentId.trim() === '') {
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
    console.error('Payment confirmation error:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Booking not found')) {
        return res.status(500).json({
          error: 'Failed to confirm payment and update booking',
          details: 'Booking not found or no changes made'
        });
      }
    }
    
    res.status(500).json({
      error: 'Failed to confirm payment and update booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
