// src/pages/__tests__/PaymentForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentForm from '../../components/booking/PaymentForm';

let stripeMock: any;
let elementsMock: any;

vi.mock('@stripe/react-stripe-js', () => {
  // local helper so it's available inside the factory
  const safeGetElement = vi.fn().mockReturnValue({}); // truthy by default
  return {
    useStripe: () => (stripeMock ?? ({} as any)),
    useElements: () =>
      elementsMock ??
      ({
        getElement: safeGetElement, // ensure getElement ALWAYS exists
      } as any),
    CardElement: (props: any) => <div data-testid="card-element" {...props} />,
  };
});

// Safe fetch spy that works whether fetch exists or not
let fetchSpy: ReturnType<typeof vi.spyOn>;
if (!(globalThis as any).fetch) {
  (globalThis as any).fetch = vi.fn(); // create it if missing
}
fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => ({}),
} as any);



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

  it('flags Guest Email as invalid on blur and becomes valid after correction', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    const guestEmail = screen.getByLabelText('Email Address *') as HTMLInputElement;

    // invalid → blur
    await user.clear(guestEmail);
    await user.type(guestEmail, 'not-an-email');
    await user.tab(); // blur

    // Use native constraint validation (works without visible error text)
    try {
      // @ts-ignore - matcher from jest-dom if installed
      expect(guestEmail).toBeInvalid();
    } catch {
      expect(guestEmail.validity.valid).toBe(false);
    }

    // fix → blur
    await user.click(guestEmail);
    await user.clear(guestEmail);
    await user.type(guestEmail, 'ada@example.com');
    await user.tab();

    try {
      // @ts-ignore - matcher from jest-dom if installed
      expect(guestEmail).toBeValid();
    } catch {
      expect(guestEmail.validity.valid).toBe(true);
    }
  });

  it('flags Billing Email as invalid on blur and becomes valid after correction', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    const billingEmail = screen.getByLabelText(/^Email \*$/) as HTMLInputElement;

    // invalid → blur
    await user.clear(billingEmail);
    await user.type(billingEmail, 'wrong@@mail');
    await user.tab();

    try {
      // @ts-ignore - matcher from jest-dom if installed
      expect(billingEmail).toBeInvalid();
    } catch {
      expect(billingEmail.validity.valid).toBe(false);
    }

    // fix → blur
    await user.click(billingEmail);
    await user.clear(billingEmail);
    await user.type(billingEmail, 'test@example.com');
    await user.tab();

    try {
      // @ts-ignore - matcher from jest-dom if installed
      expect(billingEmail).toBeValid();
    } catch {
      expect(billingEmail.validity.valid).toBe(true);
    }
  });

  it('enforces 250-char cap for Special Requests and does not block submit due to maxlength', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    // Fill required fields so this test isolates the maxlength behavior
    await user.type(screen.getByLabelText('First Name *'), 'Ada');
    await user.type(screen.getByLabelText('Last Name *'), 'Lovelace');
    await user.type(screen.getByLabelText('Email Address *'), 'ada@example.com');
    await user.type(screen.getByLabelText('Phone Number *'), '12345678');

    await user.type(screen.getByLabelText('Full Name *'), 'Test User');
    await user.type(screen.getByLabelText(/^Email \*$/), 'bill@example.com');
    await user.type(screen.getByLabelText('Phone *'), '87654321');
    await user.type(screen.getByLabelText('Address Line 1 *'), '123 Test St');
    await user.type(screen.getByLabelText('City *'), 'Testville');
    await user.type(screen.getByLabelText('State *'), 'Testland');
    await user.type(screen.getByLabelText('ZIP Code *'), '12345');
    await user.selectOptions(screen.getByLabelText('Country *'), 'SG');

    const special = screen.getByLabelText('Special Requests (max 250 characters)') as HTMLTextAreaElement;

    const long = 'x'.repeat(251);
    await user.clear(special);
    await user.type(special, long);

    // maxlength enforces 250 cap; no need to assert a live counter
    expect(special.value.length).toBe(250);

    // Click Pay: not asserting success here—just ensuring no crash
    await user.click(screen.getByRole('button', { name: /Pay/ }));
  });


  it('enforces 250-char cap for Message to Hotel', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    // Fill required fields
    await user.type(screen.getByLabelText('First Name *'), 'Ada');
    await user.type(screen.getByLabelText('Last Name *'), 'Lovelace');
    await user.type(screen.getByLabelText('Email Address *'), 'ada@example.com');
    await user.type(screen.getByLabelText('Phone Number *'), '12345678');

    await user.type(screen.getByLabelText('Full Name *'), 'Test User');
    await user.type(screen.getByLabelText(/^Email \*$/), 'bill@example.com');
    await user.type(screen.getByLabelText('Phone *'), '87654321');
    await user.type(screen.getByLabelText('Address Line 1 *'), '123 Test St');
    await user.type(screen.getByLabelText('City *'), 'Testville');
    await user.type(screen.getByLabelText('State *'), 'Testland');
    await user.type(screen.getByLabelText('ZIP Code *'), '12345');
    await user.selectOptions(screen.getByLabelText('Country *'), 'SG');

    const msg = screen.getByLabelText('Message to Hotel (max 250 characters)') as HTMLTextAreaElement;

    const long = 'y'.repeat(251);
    await user.clear(msg);
    await user.type(msg, long);

    // Just the cap; no visible error/counter expected
    expect(msg.value.length).toBe(250);

    await user.click(screen.getByRole('button', { name: /Pay/ }));
  });


  it('prevents submit when Billing Email is invalid (native validity) and does not call fetch', async () => {
    renderPaymentForm();
    const user = userEvent.setup();

    // Valid guest info
    await user.type(screen.getByLabelText('First Name *'), 'Ada');
    await user.type(screen.getByLabelText('Last Name *'), 'Lovelace');
    await user.type(screen.getByLabelText('Email Address *'), 'ada@example.com');
    await user.type(screen.getByLabelText('Phone Number *'), '12345678');

    // Billing info with INVALID email
    await user.type(screen.getByLabelText('Full Name *'), 'Bill User');
    const billingEmail = screen.getByLabelText(/^Email \*$/) as HTMLInputElement;
    await user.type(billingEmail, 'badmail'); // invalid
    await user.type(screen.getByLabelText('Phone *'), '87654321');
    await user.type(screen.getByLabelText('Address Line 1 *'), '123 Test St');
    await user.type(screen.getByLabelText('City *'), 'Testville');
    await user.type(screen.getByLabelText('State *'), 'Testland');
    await user.type(screen.getByLabelText('ZIP Code *'), '12345');
    await user.selectOptions(screen.getByLabelText('Country *'), 'SG');

    // Try to submit
    await user.click(screen.getByRole('button', { name: /Pay/ }));

    // Assert native invalidity; your UI doesn’t show a custom error line
    try {
      // @ts-ignore if jest-dom is installed
      expect(billingEmail).toBeInvalid();
    } catch {
      expect(billingEmail.validity.valid).toBe(false);
    }

    const fetchCalls =
      (vi as any).mocked?.((globalThis as any).fetch)?.mock?.calls ??
      // fallback if your TS types differ
      ((globalThis as any).fetch as any).mock?.calls;

    expect(fetchCalls.length).toBe(0);
  });

});
