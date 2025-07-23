import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

// A basic CSS-in-JS object for styling the Stripe Card Element for a better user experience.
const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) => {
  // Stripe hooks to access the Stripe and Elements objects
  const stripe = useStripe();
  const elements = useElements();

  // State for handling errors and processing status
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

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
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: amount, // Amount in cents
        }),
      });

      const { success, error: backendError } = await response.json();

      if (backendError) {
        setError(backendError);
        onPaymentError(backendError);
      } else if (success) {
        // The backend confirmed the payment was successful.
        // The parent component will handle the redirect.
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
    <form onSubmit={handleSubmit}>
      <label>
        Card details
        <CardElement options={cardElementOptions} />
      </label>
      <button type="submit" disabled={!stripe || processing} style={{ marginTop: '20px' }}>
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </form>
  );
};

export default PaymentForm;
