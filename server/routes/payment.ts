import express from 'express';
<<<<<<< HEAD
import Stripe from 'stripe';
import { BookingData } from '../../types/Booking';

// Initialize Stripe only if secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;
=======
import { updateBooking } from '../models/bookingModel';
>>>>>>> origin/main

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

<<<<<<< HEAD
  // Check if Stripe is configured
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment processing is not configured. Please set up Stripe API keys.' 
    });
  }

  // Create booking record
  const bookingId = generateBookingId();
  const booking: BookingData = {
    id: bookingId,
    ...bookingData,
    status: 'pending',
    createdAt: new Date(),
  };

  // Store booking
  bookings.set(bookingId, booking);

=======
>>>>>>> origin/main
  try {
    // Update booking status to confirmed
    await updateBooking(bookingId, paymentIntentId, 'confirmed');

    res.json({
      success: true,
      booking_id: bookingId,
      message: 'Payment confirmed and booking updated successfully',
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({
      error: 'Failed to confirm payment and update booking',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
<<<<<<< HEAD

    // Update booking with payment intent ID
    booking.paymentIntentId = paymentIntent.id;
    bookings.set(bookingId, booking);

    
    // Check if payment requires additional action (like 3D Secure)
    if (paymentIntent.status === 'requires_action') {
      return res.json({
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret
        }
      });
    } else if (paymentIntent.status === 'succeeded') {
      // Payment succeeded without additional authentication
      // Update booking status
      booking.status = 'confirmed';
      bookings.set(bookingId, booking);
      
      res.json({ 
        success: true, 
        payment_intent_id: paymentIntent.id,
        booking_id: bookingId
      });
    } else {
      res.status(400).json({ error: 'Payment failed with status: ' + paymentIntent.status });
    }

  } catch (e) {
    // Handle specific card errors sent by Stripe
    if (stripe && e instanceof Stripe.errors.StripeCardError) {
      return res.status(400).json({ error: e.message });
    }
    // Handle other generic errors
    console.error(e);
    return res.status(500).json({ error: 'An internal server error occurred.' });
=======
>>>>>>> origin/main
  }
});

export { router };
