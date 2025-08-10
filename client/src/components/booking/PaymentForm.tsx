import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateBookingRequest } from '../../../../types/Booking';
import { API_BASE_URL } from '../../config/api';
import styles from './PaymentForm.module.css';

interface PaymentFormProps {
  amount: number;
  bookingData?: CreateBookingRequest; // Booking data to send with payment
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

const PaymentForm = ({ amount, bookingData, onPaymentSuccess, onPaymentError }: PaymentFormProps) => {
  // State for handling errors and processing status
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  
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
      country: 'SG',
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
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    // Validate card details using Stripe Elements (no API call)
    const { error: paymentMethodError } = await stripe.createPaymentMethod({
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
      const errorMessage = paymentMethodError.message || "Please check your card details.";
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate billing information
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !billingAddress.name ||
      !billingAddress.email ||
      !emailRegex.test(billingAddress.email) ||
      !billingAddress.address.line1 ||
      !billingAddress.address.city ||
      !billingAddress.address.state ||
      !billingAddress.address.postal_code
    ) {
      const errorMessage = 'Please fill in all required billing information.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    try {
        if (!bookingData) {
            throw new Error('Booking data is not available.');
        }

        // 1. Create a booking first
        // Use the hotel address that's already provided in bookingData
        const finalBookingData: CreateBookingRequest = {
            ...bookingData,
        };

        const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalBookingData),
        });

        if (!bookingResponse.ok) {
            throw new Error(`Booking creation failed: ${bookingResponse.status}`);
        }

        const bookingResult = await bookingResponse.json();

        if (bookingResult.error) {
            setError(bookingResult.error);
            onPaymentError(bookingResult.error);
            setProcessing(false);
            return;
        }

        const { bookingId } = bookingResult;

        // 2. Validate payment method client-side (no actual charge)
        // This simulates payment processing for demo purposes
        const mockPaymentIntentId = `pi_demo_${bookingId}_${Date.now()}`;
        
        // Simulate a small delay for payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Confirm payment on server (update booking status)
        const confirmResponse = await fetch(`${API_BASE_URL}/api/payment/confirm-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId,
                paymentIntentId: mockPaymentIntentId,
            }),
        });

        if (!confirmResponse.ok) {
            throw new Error(`Payment confirmation failed: ${confirmResponse.status}`);
        }

        const confirmResult = await confirmResponse.json();

        if (confirmResult.error) {
            setError(confirmResult.error);
            onPaymentError(confirmResult.error);
        } else if (confirmResult.success) {
            onPaymentSuccess();
            // Navigate to the correct route with proper state data
            navigate(`/booking/confirmation`, {
                state: {
                    bookingId: confirmResult.booking_id,
                    hotel: bookingData ? {
                        id: bookingData.hotelId,
                        name: bookingData.hotelName,
                        price: bookingData.pricePerNight,
                        address: bookingData.bookingAddress, // Use the actual hotel address from bookingData
                        imageCount: 5,
                        image_details: {
                            prefix: '/listing/hotel_img_placeholder.png?id=',
                            suffix: '',
                        }
                    } : null,
                    stayDates: bookingData ? {
                        checkinDate: bookingData.checkInDate && bookingData.checkInDate !== 'N/A' ? new Date(bookingData.checkInDate) : null,
                        checkoutDate: bookingData.checkOutDate && bookingData.checkOutDate !== 'N/A' ? new Date(bookingData.checkOutDate) : null,
                    } : null,
                    totalAmount: amount / 100,
                    bookingDetails: bookingData
                }
            });
        }
    } catch (error) {
        console.error("Payment processing error:", error);
        const errorMessage = error instanceof Error ? error.message : "An error occurred while processing your payment.";
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
    // HTML for the payment form over here
    <div className={styles.container}>
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit}>
        {/* Billing Address Section */}
        <div className={styles.billingSection}>
          <h4>Billing Information</h4>  
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                value={billingAddress.name}
                onChange={(e) => handleBillingAddressChange('name', e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={billingAddress.email}
                onChange={(e) => handleBillingAddressChange('email', e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={billingAddress.phone}
              onChange={(e) => handleBillingAddressChange('phone', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address1">Address Line 1 *</label>
            <input
              id="address1"
              type="text"
              value={billingAddress.address.line1}
              onChange={(e) => handleBillingAddressChange('address.line1', e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address2">Address Line 2</label>
            <input
              id="address2"
              type="text"
              value={billingAddress.address.line2}
              onChange={(e) => handleBillingAddressChange('address.line2', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="city">City *</label>
              <input
                id="city"
                type="text"
                value={billingAddress.address.city}
                onChange={(e) => handleBillingAddressChange('address.city', e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="state">State *</label>
              <input
                id="state"
                type="text"
                value={billingAddress.address.state}
                onChange={(e) => handleBillingAddressChange('address.state', e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="zip">ZIP Code *</label>
              <input
                id="zip"
                type="text"
                value={billingAddress.address.postal_code}
                onChange={(e) => handleBillingAddressChange('address.postal_code', e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country">Country *</label>
            <select
              id="country"
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
              <CardElement 
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
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
