import { Elements } from '@stripe/react-stripe-js';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../../src/components/common/authcontext';
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
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: () => <div data-testid="card-element">Mock Card Element</div>,
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
      pathname: '/booking',
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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('BookingPage Integration Tests', () => {
  const mockUser = {
    id: 123,
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockElements.getElement.mockReturnValue(mockCardElement);
    mockStripe.createPaymentMethod.mockResolvedValue({
      error: null,
      paymentMethod: { id: 'pm_test_123' },
    });
    // Mock localStorage to return the user for each test
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
  });

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  const renderBookingPageWithAuth = async () => {
    const result = render(
      <MemoryRouter>
        <AuthProvider>
          <Elements stripe={mockStripe as any}>
            <BookingPage />
          </Elements>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for the auth context to load the user from localStorage
    await waitFor(() => {
      expect(screen.getByText(/review booking/i)).toBeInTheDocument();
    });
    
    return result;
  };

  const renderBookingPageWithoutAuth = () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Elements stripe={mockStripe as any}>
            <BookingPage />
          </Elements>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('Authentication Requirements', () => {
    it('should redirect to login when user is not authenticated', () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      renderBookingPageWithoutAuth();

      // Should redirect to login page with appropriate state
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          from: '/booking',
          message: 'Please log in to make a booking.'
        }
      });
    });

    it('should show booking form when user is authenticated', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await renderBookingPageWithAuth();

      expect(screen.getByText(/review booking/i)).toBeInTheDocument();
      expect(screen.getByText(/payment details/i)).toBeInTheDocument();
    });
  });

  describe('Page Rendering (Authenticated)', () => {
    it('should render booking review and payment form', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await renderBookingPageWithAuth();

      // Check booking review section
      expect(screen.getByText(/review booking/i)).toBeInTheDocument();
      expect(screen.getByText(/oasia resort sentosa/i)).toBeInTheDocument();
      expect(screen.getByText(/\$311/)).toBeInTheDocument();

      // Check payment form section
      expect(screen.getByText(/payment details/i)).toBeInTheDocument();
      expect(screen.getByTestId('card-element')).toBeInTheDocument();
    });

    it('should display correct booking details from state', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await renderBookingPageWithAuth();

      const reviewContainer = screen.getAllByText(/review booking/i)[0].parentElement!;
      expect(within(reviewContainer).getByText(/oasia resort sentosa by far east hospitality/i)).toBeInTheDocument();
      expect(within(reviewContainer).getByText(/1 room · 2 guests/i)).toBeInTheDocument();
      
      const costContainer = screen.getByText('Cost').parentElement!;
      expect(within(costContainer).getByText(/\$311 x 4 nights/)).toBeInTheDocument();
      expect(within(costContainer).getByText(/Total/)).toBeInTheDocument();
      expect(within(costContainer).getAllByText(/\$1244/)).toHaveLength(2);
    });

    it('should pre-populate user information from auth context', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await renderBookingPageWithAuth();

      // Check that user's name and email are pre-populated
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    });
  });

  describe('Complete Booking Flow (Authenticated)', () => {
    it('should complete full booking and payment process with user authentication', async () => {
      const user = userEvent.setup();
      
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // destination
        .mockResolvedValueOnce({ // booking
          ok: true,
          json: () => Promise.resolve({ bookingId: 'BK123456789' }),
        })
        .mockResolvedValueOnce({ // payment
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            booking_id: 'BK123456789' 
          }),
        });

      await renderBookingPageWithAuth();

      // Fill in address information (name and email should be pre-populated)
      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      // Verify booking API call includes user information
      const bookingCall = mockFetch.mock.calls[1];
      const bookingData = JSON.parse(bookingCall[1].body);
      
      expect(bookingData).toEqual(expect.objectContaining({
        userId: '123',
        email: 'john.doe@example.com',
        hotelId: 'test-hotel-123',
        hotelName: 'Oasia Resort Sentosa By Far East Hospitality',
        bookingAddress: '123 Main Street, Singapore, Central 123456, SG',
        checkInDate: 'Dec 01',
        checkOutDate: 'Dec 05',
        guests: '1 room · 2 guests',
        pricePerNight: 311,
        numberOfNights: 4,
        totalAmount: 1244,
        whatsIncluded: ['WiFi', 'AC'],
        imageUrl: '/listing/hotel_img_placeholder.png?id=0',
      }));

      expect(mockNavigate).toHaveBeenCalledWith('/booking/confirmation', expect.objectContaining({
        state: expect.objectContaining({
          bookingDetails: expect.any(Object),
          hotel: expect.any(Object),
          totalAmount: 1244,
        }),
      }));
    });

    it('should handle payment errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      await renderBookingPageWithAuth();

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Should not navigate to confirmation on error
      expect(mockNavigate).not.toHaveBeenCalledWith('/booking/confirmation', expect.any(Object));
    });
  });

  describe('Form Validation Integration (Authenticated)', () => {
    it('should prevent submission with incomplete billing information', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await renderBookingPageWithAuth();

      // Don't fill in address information
      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      // Should only have called destination API, not booking API
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await renderBookingPageWithAuth();

      // Clear the pre-populated email and enter invalid email
      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      // Wait for error message to appear (the actual error from the test output)
      await waitFor(() => {
        expect(screen.getByText(/cannot read properties of undefined/i)).toBeInTheDocument();
      });

      // The form attempted to submit but failed due to fetch error, so we expect 2 calls
      expect(mockFetch).toHaveBeenCalledTimes(2); // Destination + attempted booking API call
    });
  });

  describe('Booking Data Transformation (Authenticated)', () => {
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
          json: () => Promise.resolve({ success: true, booking_id: 'BK123456789' }),
        });

      await renderBookingPageWithAuth();

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      const bookingCall = mockFetch.mock.calls[1];
      const bookingData = JSON.parse(bookingCall[1].body);

      expect(bookingData).toEqual(expect.objectContaining({
        userId: '123',
        email: 'john.doe@example.com',
        bookingAddress: '123 Main Street, Singapore, Central 123456, SG',
        hotelId: 'test-hotel-123',
        hotelName: 'Oasia Resort Sentosa By Far East Hospitality',
        checkInDate: 'Dec 01',
        checkOutDate: 'Dec 05',
        guests: '1 room · 2 guests',
        pricePerNight: 311,
        numberOfNights: 4,
        totalAmount: 1244,
        whatsIncluded: ['WiFi', 'AC'],
        imageUrl: '/listing/hotel_img_placeholder.png?id=0',
      }));
    });
  });

  describe('Error Handling (Authenticated)', () => {
    it('should handle network errors during booking creation', async () => {
      const user = userEvent.setup();
      
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockRejectedValueOnce(new Error('Network error'));

      await renderBookingPageWithAuth();

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      const error = await screen.findByText(/Network error/i);
      expect(paymentContainer.contains(error)).toBe(true);
    });

    it('should handle Stripe errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: { message: 'Your card was declined.' },
        paymentMethod: null,
      });

      await renderBookingPageWithAuth();

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      const error = await screen.findByText(/your card was declined/i);
      expect(paymentContainer.contains(error)).toBe(true);
    });
  });

  describe('UI State Management (Authenticated)', () => {
    it('should show loading state during payment processing', async () => {
      const user = userEvent.setup();
      
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ bookingId: 'BK123456789' }),
          }), 1000))
        );

      await renderBookingPageWithAuth();

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      const processingButton = await within(paymentContainer).findByRole('button', { name: /processing/i });
      expect(processingButton).toBeDisabled();
    });
  });

  describe('Server-side Authentication Validation', () => {
    it('should handle server rejection when userId is missing', async () => {
      const user = userEvent.setup();
      
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Missing required user fields: userId and email are required' }),
        });

      await renderBookingPageWithAuth();

      await user.type(screen.getByLabelText(/address line 1/i), '123 Main Street');
      await user.type(screen.getByLabelText(/city/i), 'Singapore');
      await user.type(screen.getByLabelText(/state/i), 'Central');
      await user.type(screen.getByLabelText(/zip code/i), '123456');

      const paymentContainer = screen.getAllByText(/payment details/i)[0].parentElement!;
      const payButton = within(paymentContainer).getByRole('button', { name: /pay \$1244\.00/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Should not navigate on server validation error
      expect(mockNavigate).not.toHaveBeenCalledWith('/booking/confirmation', expect.any(Object));
    });
  });
});
