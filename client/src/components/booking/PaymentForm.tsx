import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import styles from './PaymentForm.module.css';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

interface BillingAddress {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) => {
  // State for handling errors and processing status
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // State for billing address
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

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
      billing_details: {
        name: billingAddress.name,
        email: billingAddress.email,
        phone: billingAddress.phone,
        address: billingAddress.address,
      },
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

  const handleBillingAddressChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setBillingAddress(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setBillingAddress(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className={styles.container}>
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit}>
        {/* Billing Address Section */}
        <div className={styles.billingSection}>
          <h4>Billing Information</h4>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input
                type="text"
                value={billingAddress.name}
                onChange={(e) => handleBillingAddressChange('name', e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                value={billingAddress.email}
                onChange={(e) => handleBillingAddressChange('email', e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Phone</label>
            <input
              type="tel"
              value={billingAddress.phone}
              onChange={(e) => handleBillingAddressChange('phone', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Address Line 1 *</label>
            <input
              type="text"
              value={billingAddress.address.line1}
              onChange={(e) => handleBillingAddressChange('address.line1', e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Address Line 2</label>
            <input
              type="text"
              value={billingAddress.address.line2}
              onChange={(e) => handleBillingAddressChange('address.line2', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>City *</label>
              <input
                type="text"
                value={billingAddress.address.city}
                onChange={(e) => handleBillingAddressChange('address.city', e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>State *</label>
              <input
                type="text"
                value={billingAddress.address.state}
                onChange={(e) => handleBillingAddressChange('address.state', e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>ZIP Code *</label>
              <input
                type="text"
                value={billingAddress.address.postal_code}
                onChange={(e) => handleBillingAddressChange('address.postal_code', e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Country *</label>
            <select
              value={billingAddress.address.country}
              onChange={(e) => handleBillingAddressChange('address.country', e.target.value)}
              className={styles.input}
              required
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="SG">Singapore</option>
              <option value="MY">Malaysia</option>
              <option value="TH">Thailand</option>
              <option value="ID">Indonesia</option>
              <option value="PH">Philippines</option>
              <option value="VN">Vietnam</option>
            </select>
          </div>
        </div>

        {/* Card Details Section */}
        <div className={styles.cardSection}>
          <h4>Card Details</h4>
          <div className={styles.formGroup}>
            <label>Card Information</label>
            <div className={styles.cardElement}>
              <CardElement />
            </div>
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
