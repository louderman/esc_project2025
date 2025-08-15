import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentForm from './PaymentForm';

// Mock Stripe hooks
vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    useStripe: () => ({
      createPaymentMethod: vi.fn().mockResolvedValue({ error: null }),
    }),
    useElements: () => ({
      getElement: vi.fn().mockReturnValue({}),
    }),
  };
});

// Mock fetch
global.fetch = vi.fn();

const stripePromise = loadStripe('pk_test_your_test_key');

const mockBookingData = {
  userId: '123',
  email: 'test@example.com',
  hotelId: '456',
  hotelName: 'Test Hotel',
  checkInDate: '2025-08-12',
  checkOutDate: '2025-08-15',
  guests: '2 adults, 1 child',
  pricePerNight: 150,
  numberOfNights: 3,
  numberOfRooms: 1,
  totalAmount: 450,
  whatsIncluded: ['Breakfast'],
  imageUrl: 'test.jpg',
  bookingAddress: '123 Test St',
};

describe('PaymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display price breakdown correctly', () => {
    render(
      <MemoryRouter>
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={45000}
            totalAmount={450}
            pricePerNight={150}
            numberOfNights={3}
            bookingData={mockBookingData}
            onPaymentSuccess={() => {}}
            onPaymentError={() => {}}
          />
        </Elements>
      </MemoryRouter>
    );

    // Check if price breakdown is displayed
    expect(screen.getByText('Price Summary')).toBeInTheDocument();
    expect(screen.getByText('1 room x 3 nights')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    expect(screen.getByText('Taxes and fees (10%)')).toBeInTheDocument();
    expect(screen.getByText('$45.00')).toBeInTheDocument();
    expect(screen.getByText('$495.00')).toBeInTheDocument();
  });

  it('should handle billing address changes', () => {
    render(
      <MemoryRouter>
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={45000}
            totalAmount={450}
            pricePerNight={150}
            numberOfNights={3}
            bookingData={mockBookingData}
            onPaymentSuccess={() => {}}
            onPaymentError={() => {}}
          />
        </Elements>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText('Full Name *') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');

    const emailInput = screen.getByLabelText('Email *') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    expect(emailInput.value).toBe('john.doe@example.com');
  });

  it('should display correct pay button amount', () => {
    render(
      <MemoryRouter>
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={45000}
            totalAmount={450}
            pricePerNight={150}
            numberOfNights={3}
            bookingData={mockBookingData}
            onPaymentSuccess={() => {}}
            onPaymentError={() => {}}
          />
        </Elements>
      </MemoryRouter>
    );

    const payButton = screen.getByText('Pay $495.00');
    expect(payButton).toBeInTheDocument();
  });
});
