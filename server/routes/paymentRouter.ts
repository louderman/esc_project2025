import express from 'express';
import Stripe from 'stripe';
import { BookingData } from '../../types/Booking';

// This will be initialized with your secret key in server.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const router = express.Router();

// In-memory storage for bookings (in production, use a database)
const bookings: Map<string, BookingData> = new Map();

// Generate a unique booking ID that doesn't already exist
function generateBookingId(): string {
  let bookingId: string;
  do {
    bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
  } while (bookings.has(bookingId));
  return bookingId;
}

// Create booking and payment intent
router.post('/create-payment-intent', async (req, res) => {
  const { paymentMethodId, amount, bookingData } = req.body;

  if (!paymentMethodId || !amount) {
    return res.status(400).json({ error: 'Missing paymentMethodId or amount' });
  }

  if (!bookingData) {
    return res.status(400).json({ error: 'Missing booking data' });
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

  try {
    // Create and confirm a PaymentIntent with authentication disabled for testing
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd', // You can make this dynamic if needed
      payment_method: paymentMethodId,
      confirm: true,
      confirmation_method: 'manual', // Disable authentication for testing
      return_url: `https://localhost:5173/booking/confirmation?bookingId=${bookingId}`,
    });

    // Update booking with payment intent ID
    booking.paymentIntentId = paymentIntent.id;
    bookings.set(bookingId, booking);

    // Check if payment requires additional action (like 3D Secure)
    if (paymentIntent.status === 'requires_action') {
      return res.json({
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        },
      });
    } else if (paymentIntent.status === 'succeeded') {
      // Payment succeeded without additional authentication
      // Update booking status
      booking.status = 'confirmed';
      bookings.set(bookingId, booking);

      res.json({
        success: true,
        payment_intent_id: paymentIntent.id,
        booking_id: bookingId,
      });
    } else {
      res
        .status(400)
        .json({ error: 'Payment failed with status: ' + paymentIntent.status });
    }
  } catch (e) {
    // Handle specific card errors sent by Stripe
    if (e instanceof Stripe.errors.StripeCardError) {
      return res.status(400).json({ error: e.message });
    }
    // Handle other generic errors
    console.error(e);
    return res
      .status(500)
      .json({ error: 'An internal server error occurred.' });
  }
});

// Get booking by ID
router.get('/booking/:bookingId', (req, res) => {
  const { bookingId } = req.params;

  const booking = bookings.get(bookingId);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({ booking });
});

// Get all bookings (for debugging/admin purposes)
router.get('/bookings', (req, res) => {
  const allBookings = Array.from(bookings.values());
  res.json({ bookings: allBookings });
});

export { router };
