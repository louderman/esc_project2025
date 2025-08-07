import express from 'express';
import Stripe from 'stripe';
import { CreateBookingRequest } from '../../types/Booking';
import { createBooking, getBookingById, updateBooking } from '../models/bookingModel';

// Initialize Stripe only if secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

const router = express.Router();

// Create booking
router.post('/', async (req, res) => {
  try {
    const bookingData: CreateBookingRequest = req.body;
    
    // Validate required fields
    if (!bookingData.userId || !bookingData.email || !bookingData.hotelId || 
        !bookingData.hotelName || !bookingData.checkInDate || !bookingData.checkOutDate ||
        !bookingData.guests || !bookingData.bookingAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, email, hotelId, hotelName, checkInDate, checkOutDate, guests, or bookingAddress' 
      });
    }

    if (bookingData.pricePerNight <= 0 || bookingData.numberOfNights <= 0 || bookingData.totalAmount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid booking data: prices and nights must be positive values' 
      });
    }

    const bookingId = await createBooking(bookingData);
    
    res.status(201).json({ 
      bookingId,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const booking = await getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      error: 'Failed to fetch booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentIntentId, status } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    if (!paymentIntentId || !status) {
      return res.status(400).json({ error: 'Payment Intent ID and status are required' });
    }

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "confirmed" or "cancelled"' });
    }

    await updateBooking(id, paymentIntentId, status);
    
    res.json({ 
      message: 'Booking updated successfully',
      bookingId: id,
      status 
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    if (error instanceof Error && error.message.includes('Booking not found')) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(500).json({ 
      error: 'Failed to update booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create booking and payment intent
router.post('/create-payment-intent', async (req, res) => {
  const { paymentMethodId, amount, bookingId } = req.body;

  if (!paymentMethodId || !amount) {
    return res.status(400).json({ error: 'Missing paymentMethodId or amount' });
  }

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing booking ID' });
  }

  // Check if Stripe is configured
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment processing is not configured. Please set up Stripe API keys.' 
    });
  }

  try {
    // Create and confirm a PaymentIntent with authentication disabled for testing
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd', // You can make this dynamic if needed
      payment_method: paymentMethodId,
      confirm: true,
      confirmation_method: 'manual', // Disable authentication for testing
      return_url: `https://localhost:5173/booking/confirmation?bookingId=${bookingId}`
    });

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
      await updateBooking(bookingId, paymentIntent.id, 'confirmed');
      
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
