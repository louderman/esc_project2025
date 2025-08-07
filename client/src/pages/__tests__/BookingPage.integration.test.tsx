import { Elements } from '@stripe/react-stripe-js';
import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import BookingPage from '../BookingPage';

// Mock Stripe
const mockStripe = {
  createPaymentMethod: vi.fn(),
  elements: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(),
};

const mockCardElement = {
  mount: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn(),
  update: vi.fn(),
};

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe)),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardElement: () => <div data-testid='card-element'>Mock Card Element</div>,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        bookingDetails: {
          selectedRoom: { amenities: ['WiFi', 'AC'] },
          numberOfGuests: { adults: 2, children: 0, total: 2 },
          numberOfNights: 4,
          numberOfRooms: 1,
          checkinDate: '2024-12-01',
          checkoutDate: '2024-12-05',
          totalAmount: 1244,
          pricePerNight: 311,
        },
        hotel: {
          id: 'test-hotel-123',
          name: 'Oasia Resort Sentosa By Far East Hospitality',
          rating: 4.5,
          reviewCount: 1250,
          price: 311,
        },
        totalAmount: 1244,
      },
    }),
  };
});

let consoleErrorSpy: MockInstance;
beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockClear();
});

describe('BookingPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockElements.getElement.mockReturnValue(mockCardElement);
    mockStripe.createPaymentMethod.mockResolvedValue({
      error: null,
      paymentMethod: { id: 'pm_test_123' },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  const renderBookingPage = () => {
    return render(
      <MemoryRouter>
        <Elements stripe={mockStripe as any}>
          <BookingPage />
        </Elements>
      </MemoryRouter>
    );
  };

  describe('Page Rendering', () => {
    it('should render booking review and payment form', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });
      renderBookingPage();

      // Check booking review section
      expect(screen.getByText(/review booking/i)).toBeInTheDocument();
      expect(screen.getByText(/oasia resort sentosa/i)).toBeInTheDocument();
      expect(screen.getByText(/\$311/)).toBeInTheDocument();

      // Check payment form section
      expect(screen.getByText(/payment details/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByTestId('card-element')).toBeInTheDocument();
    });

    it('should display correct booking details from state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });
      renderBookingPage();

      const reviewContainer =
        screen.getAllByText(/review booking/i)[0].parentElement!;
      expect(
        within(reviewContainer).getByText(
          /oasia resort sentosa by far east hospitality/i
        )
      ).toBeInTheDocument();
      expect(
        within(reviewContainer).getByText(/1 room · 2 guests/i)
      ).toBeInTheDocument();

      const costContainer = screen.getByText('Cost').parentElement!;
      expect(
        within(costContainer).getByText(/\$311 x 4 nights/)
      ).toBeInTheDocument();
      expect(within(costContainer).getByText(/Total/)).toBeInTheDocument();
      expect(within(costContainer).getAllByText(/\$1244/)).toHaveLength(2);
    });
  });

  describe('Complete Booking Flow', () => {
    it('should complete full booking and payment process', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // destination
        .mockResolvedValueOnce({
          // booking
          ok: true,
          json: () => Promise.resolve({ bookingId: 'BK123456789' }),
        })
        .mockResolvedValueOnce({
          // payment
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              booking_id: 'BK123456789',
            }),
        });

      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/bookings'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test-hotel-123'),
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/booking/confirmation',
        expect.objectContaining({
          state: expect.objectContaining({
            bookingDetails: expect.any(Object),
            hotel: expect.any(Object),
            totalAmount: 1244,
          }),
        })
      );
    });

    it('should handle payment errors gracefully', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation Integration', () => {
    it('should prevent submission with incomplete billing information', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });
      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });
      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      // Wait a bit and verify that the form validation prevented submission
      await waitFor(() => {
        // Only the destination fetch should have been called, not the booking API
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // The form should not have submitted due to invalid email validation
      // This test verifies that the validation logic is working correctly
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Booking Data Transformation', () => {
    it('should correctly transform booking page data for API', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ bookingId: 'BK123456789' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({ success: true, booking_id: 'BK123456789' }),
        });

      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      const bookingCall = mockFetch.mock.calls[1];
      const bookingData = JSON.parse(bookingCall[1].body);

      expect(bookingData).toEqual(
        expect.objectContaining({
          hotelId: 'test-hotel-123',
          hotelName: 'Oasia Resort Sentosa By Far East Hospitality',
          checkInDate: expect.any(String),
          checkOutDate: expect.any(String),
          guests: expect.any(String),
          pricePerNight: 311,
          numberOfNights: 4,
          totalAmount: 1244,
          whatsIncluded: expect.any(Array),
          imageUrl: expect.any(String),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during booking creation', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockRejectedValueOnce(new Error('Network error'));

      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      const errorElements = await screen.findAllByText(/Network error/i);
      const paymentFormError = errorElements.find((el) =>
        paymentContainer.contains(el)
      );
      expect(paymentFormError).toBeTruthy();
    });

    it('should handle Stripe errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      mockStripe.createPaymentMethod.mockResolvedValue({
        error: { message: 'Your card was declined.' },
        paymentMethod: null,
      });

      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      const errorElements = await screen.findAllByText(
        /your card was declined/i
      );
      const paymentFormError = errorElements.find((el) =>
        paymentContainer.contains(el)
      );
      expect(paymentFormError).toBeTruthy();
    });
  });

  describe('UI State Management', () => {
    it('should show loading state during payment processing', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: () => Promise.resolve({ bookingId: 'BK123456789' }),
                  }),
                1000
              )
            )
        );

      renderBookingPage();

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 Main Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer =
        screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', {
        name: /pay \$1244\.00/i,
      });
      await user.click(payButton);

      const processingButton = await within(paymentContainer).findByRole(
        'button',
        { name: /processing/i }
      );
      expect(processingButton).toBeDisabled();
    });
  });
});
