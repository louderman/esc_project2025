import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateBookingRequest } from '../../../../types/Booking';
import { API_BASE_URL } from '../../config/api';
import styles from './PaymentForm.module.css';

interface PaymentFormProps {
  amount: number;
  totalAmount: number;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  pricePerNight: number;
  numberOfNights: number;
  bookingData?: CreateBookingRequest; // Booking data to send with payment
  selectedRoom?: any; // Additional room data for confirmation page
  hotelImages?: string[]; // Hotel images array for confirmation page
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

interface GuestInformation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  specialRequests?: string;
}

const PaymentForm = ({
  amount,
  totalAmount,
  pricePerNight,
  numberOfNights,
  bookingData,
  selectedRoom,
  hotelImages,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) => {
  // State for handling errors and processing status
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const numberOfRooms = bookingData?.numberOfRooms || 1;
  const taxes = totalAmount * 0.1;
  const finalAmount = totalAmount + taxes;


  const numberOfRooms = bookingData?.numberOfRooms || 1;
  const taxes = totalAmount * 0.1;
  const finalAmount = totalAmount + taxes;

  
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

  // State for guest information
  const [guestInformation, setGuestInformation] = useState<GuestInformation>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailAddress: '',
    specialRequests: '',
  });

  // State for message to hotel (separate from special requests)
  const [messageToHotel, setMessageToHotel] = useState<string>('');

  // State for guest information
  const [guestInformation, setGuestInformation] = useState<GuestInformation>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailAddress: '',
    specialRequests: '',
  });

  // State for message to hotel (separate from special requests)
  const [messageToHotel, setMessageToHotel] = useState<string>('');

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

    // Validate guest information
    // Validate guest information
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !guestInformation.firstName ||
      !guestInformation.lastName ||
      !guestInformation.phoneNumber ||
      !guestInformation.emailAddress ||
      !emailRegex.test(guestInformation.emailAddress)
    ) {
      const errorMessage = 'Please fill in all required guest information including phone number.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate special requests length
    if (guestInformation.specialRequests && guestInformation.specialRequests.length > 250) {
      const errorMessage = 'Special requests must be 250 characters or less.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate message to hotel length
    if (messageToHotel && messageToHotel.length > 250) {
      const errorMessage = 'Message to hotel must be 250 characters or less.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate billing information
    if (
      !guestInformation.firstName ||
      !guestInformation.lastName ||
      !guestInformation.phoneNumber ||
      !guestInformation.emailAddress ||
      !emailRegex.test(guestInformation.emailAddress)
    ) {
      const errorMessage = 'Please fill in all required guest information including phone number.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate special requests length
    if (guestInformation.specialRequests && guestInformation.specialRequests.length > 250) {
      const errorMessage = 'Special requests must be 250 characters or less.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate message to hotel length
    if (messageToHotel && messageToHotel.length > 250) {
      const errorMessage = 'Message to hotel must be 250 characters or less.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    // Validate billing information
    if (
      !billingAddress.name ||
      !billingAddress.email ||
      !billingAddress.phone ||
      !billingAddress.phone ||
      !emailRegex.test(billingAddress.email) ||
      !billingAddress.address.line1 ||
      !billingAddress.address.city ||
      !billingAddress.address.state ||
      !billingAddress.address.postal_code
    ) {
      const errorMessage = 'Please fill in all required billing information including phone number.';
      const errorMessage = 'Please fill in all required billing information including phone number.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
      return;
    }

    try {
        if (!bookingData) {
            throw new Error('Booking data is not available.');
        }

        // 1. Create a booking first using the new compliant format
        // 1. Create a booking first using the new compliant format
        const finalBookingData: CreateBookingRequest = {
            userId: bookingData.userId,
            destinationId: bookingData.destinationId,
            hotelId: bookingData.hotelId,
            hotelName: bookingData.hotelName,
            hotelAddress: bookingData.hotelAddress,
            imageUrl: bookingData.imageUrl,
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            numberOfNights: bookingData.numberOfNights,
            numberOfRooms: bookingData.numberOfRooms,
            adults: bookingData.adults,
            children: bookingData.children,
            roomTypes: bookingData.roomTypes,
            messageToHotel: messageToHotel || undefined, // Use separate message to hotel field
            pricePerNight: bookingData.pricePerNight,
            totalAmount: bookingData.totalAmount,
            whatsIncluded: bookingData.whatsIncluded,
            guestInformation: guestInformation,
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
                    hotel: {
                    hotel: {
                        id: bookingData.hotelId,
                        name: bookingData.hotelName,
                        price: bookingData.pricePerNight,
                        address: bookingData.hotelAddress,
                        address: bookingData.hotelAddress,
                        imageCount: hotelImages ? hotelImages.length : 1,
                        image_details: {
                            prefix: hotelImages && hotelImages.length > 0 ? hotelImages[0] : '/listing/hotel_img_placeholder.png',
                            suffix: '',
                        },
                        hotelImages: hotelImages,
                    },
                    stayDates: {
                        hotelImages: hotelImages,
                    },
                    stayDates: {
                        checkinDate: bookingData.checkInDate && bookingData.checkInDate !== 'N/A' ? new Date(bookingData.checkInDate) : null,
                        checkoutDate: bookingData.checkOutDate && bookingData.checkOutDate !== 'N/A' ? new Date(bookingData.checkOutDate) : null,
                    },
                    totalAmount: finalAmount,
                    bookingDetails: {
                        ...bookingData,
                        selectedRoom: selectedRoom,
                        numberOfGuests: `${bookingData.adults + bookingData.children} guests`,
                        numberOfNights: bookingData.numberOfNights,
                        numberOfRooms: bookingData.numberOfRooms,
                        checkinDate: bookingData.checkInDate,
                        checkoutDate: bookingData.checkOutDate,
                        pricePerNight: bookingData.pricePerNight,
                        hotelImage: bookingData.imageUrl,
                        hotelImages: hotelImages,
                        guestInformation: guestInformation,
                    }
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
      setBillingAddress((prev: BillingAddress) => ({
      setBillingAddress((prev: BillingAddress) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setBillingAddress((prev: BillingAddress) => ({
      setBillingAddress((prev: BillingAddress) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    // HTML for the payment form over here
    <div className={styles.container}>
      <h3>Payment Details</h3>

      {/* Price Breakdown Section */}
      <div className={styles.priceBreakdown}>
        <h4 className={styles.priceTitle}>Price Summary</h4>
        <div className={styles.priceItem}>
          <span>
            {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''} x {numberOfNights} night
            {numberOfNights > 1 ? 's' : ''}
          </span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className={styles.priceItem}>
          <span>Taxes and fees (10%)</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className={`${styles.priceItem} ${styles.total}`}>
          <span>Total</span>
          <span>${finalAmount.toFixed(2)}</span>
        </div>
      </div>


      {/* Price Breakdown Section */}
      <div className={styles.priceBreakdown}>
        <h4 className={styles.priceTitle}>Price Summary</h4>
        <div className={styles.priceItem}>
          <span>
            {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''} x {numberOfNights} night
            {numberOfNights > 1 ? 's' : ''}
          </span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className={styles.priceItem}>
          <span>Taxes and fees (10%)</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className={`${styles.priceItem} ${styles.total}`}>
          <span>Total</span>
          <span>${finalAmount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Guest Information Section */}
        <div className={styles.guestSection}>
          <h4>Guest Information</h4>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={guestInformation.firstName}
                onChange={(e) => setGuestInformation({...guestInformation, firstName: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={guestInformation.lastName}
                onChange={(e) => setGuestInformation({...guestInformation, lastName: e.target.value})}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="guestEmail">Email Address *</label>
              <input
                id="guestEmail"
                type="email"
                value={guestInformation.emailAddress}
                onChange={(e) => setGuestInformation({...guestInformation, emailAddress: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="guestPhone">Phone Number *</label>
              <input
                id="guestPhone"
                type="tel"
                value={guestInformation.phoneNumber}
                onChange={(e) => setGuestInformation({...guestInformation, phoneNumber: e.target.value})}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="specialRequests">Special Requests (max 250 characters)</label>
            <textarea
              id="specialRequests"
              value={guestInformation.specialRequests}
              onChange={(e) => setGuestInformation({...guestInformation, specialRequests: e.target.value})}
              className={styles.textarea}
              maxLength={250}
              rows={3}
              placeholder="Any special requests for your stay..."
            />
            <small className={styles.charCount}>
              {guestInformation.specialRequests?.length || 0}/250 characters
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="messageToHotel">Message to Hotel (max 250 characters)</label>
            <textarea
              id="messageToHotel"
              value={messageToHotel}
              onChange={(e) => setMessageToHotel(e.target.value)}
              className={styles.textarea}
              maxLength={250}
              rows={3}
              placeholder="Any message you'd like to send to the hotel..."
            />
            <small className={styles.charCount}>
              {messageToHotel.length}/250 characters
            </small>
          </div>
        </div>

        {/* Guest Information Section */}
        <div className={styles.guestSection}>
          <h4>Guest Information</h4>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={guestInformation.firstName}
                onChange={(e) => setGuestInformation({...guestInformation, firstName: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={guestInformation.lastName}
                onChange={(e) => setGuestInformation({...guestInformation, lastName: e.target.value})}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="guestEmail">Email Address *</label>
              <input
                id="guestEmail"
                type="email"
                value={guestInformation.emailAddress}
                onChange={(e) => setGuestInformation({...guestInformation, emailAddress: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="guestPhone">Phone Number *</label>
              <input
                id="guestPhone"
                type="tel"
                value={guestInformation.phoneNumber}
                onChange={(e) => setGuestInformation({...guestInformation, phoneNumber: e.target.value})}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="specialRequests">Special Requests (max 250 characters)</label>
            <textarea
              id="specialRequests"
              value={guestInformation.specialRequests}
              onChange={(e) => setGuestInformation({...guestInformation, specialRequests: e.target.value})}
              className={styles.textarea}
              maxLength={250}
              rows={3}
              placeholder="Any special requests for your stay..."
            />
            <small className={styles.charCount}>
              {guestInformation.specialRequests?.length || 0}/250 characters
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="messageToHotel">Message to Hotel (max 250 characters)</label>
            <textarea
              id="messageToHotel"
              value={messageToHotel}
              onChange={(e) => setMessageToHotel(e.target.value)}
              className={styles.textarea}
              maxLength={250}
              rows={3}
              placeholder="Any message you'd like to send to the hotel..."
            />
            <small className={styles.charCount}>
              {messageToHotel.length}/250 characters
            </small>
          </div>
        </div>

        {/* Billing Address Section */}
        <div className={styles.billingSection}>
          <h4>Billing Information</h4>  
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name *</label>
              <input
                data-cy="billing-full-name"
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
                data-cy="billing-email"
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
            <label htmlFor="phone">Phone *</label>
            <label htmlFor="phone">Phone *</label>
            <input
              data-cy="billing-phone"
              id="phone"
              type="tel"
              value={billingAddress.phone}
              onChange={(e) => handleBillingAddressChange('phone', e.target.value)}
              className={styles.input}
              required
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address1">Address Line 1 *</label>
            <input
              data-cy="billing-addressLine1"
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
              data-cy="billing-addressLine2"
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
                data-cy="billing-city"
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
                data-cy="billing-state"
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
                data-cy="billing-zip-code"
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
            <div className={styles.cardElement} data-cy="billing-card-info">
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
          data-cy="create-submit-btn"
          type="submit"
          disabled={!stripe || processing}
          className={styles.payButton}
        >
          {processing ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
          {processing ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default PaymentForm;
