// src/components/booking/PaymentForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentForm from '../../components/booking/PaymentForm';

// --- Stripe mocks: make hooks truthy so the real form renders ---
vi.mock('@stripe/react-stripe-js', () => {
  // Return minimal-but-truthy hook values and a stub CardElement
  return {
    useStripe: () => ({} as any),
    useElements: () => ({} as any),
    CardElement: (props: any) => <div data-testid="card-element" {...props} />,
  };
});

// In case the component calls useNavigate during submit (we never submit here,
// but this avoids accidental crashes if implementation changes)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderPaymentForm() {
  const pricePerNight = 1.5; // keep tiny numbers so totals stay simple in snapshots
  const numberOfNights = 3;
  const numberOfRooms = 1;
  const subtotal = pricePerNight * numberOfNights * numberOfRooms; // 4.5
  const taxes = subtotal * 0.1; // 0.45
  const totalAmount = subtotal + taxes; // 4.95

  const onPaymentSuccess = vi.fn();
  const onPaymentError = vi.fn();

  render(
    <PaymentForm
      amount={subtotal}
      totalAmount={totalAmount}
      pricePerNight={pricePerNight}
      numberOfNights={numberOfNights}
      numberOfRooms={numberOfRooms}
      // supply a lightweight bookingData so any UI that reads it has values
      bookingData={{
        userId: 'u1',
        email: 'ada@example.com',
        hotelId: 'hotel-456',
        hotelName: 'Test Hotel',
        bookingAddress: '123 Test St',
        imageUrl: '/img/0.jpg',
        checkInDate: '2025-08-10',
        checkOutDate: '2025-08-12',
        guests: '2 adults, 0 children',
        pricePerNight,
        numberOfNights,
        totalAmount,
        whatsIncluded: ['WiFi'],
      }}
      selectedRoom={{
        room: { roomType: 'Standard Single Room' } as any,
        rate: { price: pricePerNight } as any,
      }}
      hotelImages={['/img/0.jpg']}
      onPaymentSuccess={onPaymentSuccess}
      onPaymentError={onPaymentError}
    />
  );

  return { onPaymentSuccess, onPaymentError };
}

describe('PaymentForm (inputs only)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows typing Guest Information fields', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    const firstName = screen.getByLabelText('First Name *') as HTMLInputElement;
    const lastName = screen.getByLabelText('Last Name *') as HTMLInputElement;
    const guestEmail = screen.getByLabelText('Email Address *') as HTMLInputElement;
    const guestPhone = screen.getByLabelText('Phone Number *') as HTMLInputElement;

    await user.clear(firstName);
    await user.type(firstName, 'Ada');
    await user.clear(lastName);
    await user.type(lastName, 'Lovelace');
    await user.clear(guestEmail);
    await user.type(guestEmail, 'ada@example.com');
    await user.clear(guestPhone);
    await user.type(guestPhone, '12345678');

    expect(firstName.value).toBe('Ada');
    expect(lastName.value).toBe('Lovelace');
    expect(guestEmail.value).toBe('ada@example.com');
    expect(guestPhone.value).toBe('12345678');
  });

  it('allows typing Billing Information fields', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    const fullName = screen.getByLabelText('Full Name *') as HTMLInputElement;
    const billingEmail = screen.getByLabelText(/^Email \*$/) as HTMLInputElement; // avoid clashing with "Email Address *"
    const billingPhone = screen.getByLabelText('Phone *') as HTMLInputElement;
    const address1 = screen.getByLabelText('Address Line 1 *') as HTMLInputElement;
    const address2 = screen.getByLabelText('Address Line 2') as HTMLInputElement;
    const city = screen.getByLabelText('City *') as HTMLInputElement;
    const state = screen.getByLabelText('State *') as HTMLInputElement;
    const zip = screen.getByLabelText('ZIP Code *') as HTMLInputElement;
    const country = screen.getByLabelText('Country *') as HTMLSelectElement;

    await user.type(fullName, 'Test User');
    await user.type(billingEmail, 'test@example.com');
    await user.type(billingPhone, '87654321');
    await user.type(address1, '123 Test St');
    await user.type(address2, 'Unit 9');
    await user.type(city, 'Testville');
    await user.type(state, 'Testland');
    await user.type(zip, '12345');
    await user.selectOptions(country, 'SG'); // Singapore

    expect(fullName.value).toBe('Test User');
    expect(billingEmail.value).toBe('test@example.com');
    expect(billingPhone.value).toBe('87654321');
    expect(address1.value).toBe('123 Test St');
    expect(address2.value).toBe('Unit 9');
    expect(city.value).toBe('Testville');
    expect(state.value).toBe('Testland');
    expect(zip.value).toBe('12345');
    expect(country.value).toBe('SG');
  });
});
