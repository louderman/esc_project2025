import express from 'express';
import Stripe from 'stripe';

// This will be initialized with your secret key in server.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  const { paymentMethodId, amount } = req.body;

  if (!paymentMethodId || !amount) {
    return res.status(400).json({ error: 'Missing paymentMethodId or amount' });
  }

  try {
    // Create and confirm a PaymentIntent with authentication disabled for testing
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd', // You can make this dynamic if needed
      payment_method: paymentMethodId,
      confirm: true,
      confirmation_method: 'manual', // Disable authentication for testing
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Prevents redirects for this flow
      }
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
      res.json({ success: true, payment_intent_id: paymentIntent.id });
    } else {
      res.status(400).json({ error: 'Payment failed with status: ' + paymentIntent.status });
    }

  } catch (e) {
    // Handle specific card errors sent by Stripe
    if (e instanceof Stripe.errors.StripeCardError) {
      return res.status(400).json({ error: e.message });
    }
    // Handle other generic errors
    console.error(e);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

export default router;
