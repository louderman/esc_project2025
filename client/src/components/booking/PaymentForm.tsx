import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import styles from './PaymentForm.module.css';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) => {
  // State for handling errors and processing status
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Stripe hooks - these will return null if Elements provider is not available
  const stripe = useStripe();
  const elements = useElements();

  // If Stripe is not available, show a placeholder
  if (!stripe || !elements) {
    return (
      <div className={styles.container}>
        <h3>Payment Details</h3>
        <div className={styles.stripeNotReady}>
          <p>Payment form will be available once Stripe is configured.</p>
          <div className={styles.formGroup}>
            <label>Card details</label>
            <div className={styles.cardElementPlaceholder}>
              Stripe payment form (requires Stripe Elements provider)
            </div>
          </div>
          <button
            type="button"
            disabled
            className={`${styles.payButton} ${styles.disabled}`}
          >
            Pay ${(amount / 100).toFixed(2)} (Stripe Setup Required)
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Block native form submission
    event.preventDefault();

    // Bail out if Stripe.js hasn't loaded yet
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Get a reference to the mounted CardElement
    const cardElement = elements.getElement(CardElement);

    if (cardElement == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentMethodError) {
      const errorMessage = paymentMethodError.message || "An unknown payment error occurred.";
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    //
    // --- BACKEND COMMUNICATION ---
    // Here you will send the `paymentMethod.id` to your backend to create a PaymentIntent.
    //
    try {
      const response = await fetch(API_ENDPOINTS.PAYMENT.CREATE_PAYMENT_INTENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: amount, // Amount in cents
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        onPaymentError(result.error);
      } else if (result.requires_action) {
        // Handle additional authentication if required
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.payment_intent.client_secret
        );
        
        if (confirmError) {
          setError(confirmError.message || 'Authentication failed');
          onPaymentError(confirmError.message || 'Authentication failed');
        } else {
          // Payment succeeded after authentication
          onPaymentSuccess();
        }
      } else if (result.success) {
        // Payment succeeded without additional authentication
        console.log('Payment succeeded with ID:', result.payment_intent_id);
        onPaymentSuccess();
      } else {
        setError('An unknown error occurred on the server.');
        onPaymentError('An unknown error occurred on the server.');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while contacting the server.';
      setError(errorMessage);
      onPaymentError(errorMessage);
    }

    setProcessing(false);
  };

  return (
    <div className={styles.container}>
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Card details</label>
          <div className={styles.cardElement}>
            <CardElement />
          </div>
        </div>
        <button
          type="submit"
          disabled={!stripe || processing}
          className={styles.payButton}
        >
          {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default PaymentForm;
