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
    // Create and confirm a PaymentIntent in a single API call.
    // This attempts to charge the card immediately.
    await stripe.paymentIntents.create({
      amount,
      currency: 'usd', // You can make this dynamic if needed
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Prevents redirects for this flow
      }
    });

    // If the create call is successful, the payment is processed.
    res.json({ success: true });

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
