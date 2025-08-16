import React from 'react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PastBookingPage from '../PastBookingPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual: any = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock fetch
const fetchMock = vi.fn();
Object.defineProperty(global, 'fetch', { value: fetchMock, writable: true });

interface MockBooking {
  id: string;
  userId: string;
  hotelName: string;
  hotelAddress: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  numberOfNights?: number;
  numberOfRooms: number;
  adults: number;
  children?: number | null;
  totalAmount: number;
}

interface MockUser {
  id: string;
  name: string;
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('PastBookingPage Frontend Unit Tests', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // TC_PASTBOOKING_1
  describe('TC_PASTBOOKING_1: Booking cards render with correct data', () => {
    it('displays booking history heading and booking cards with all required info', async () => {
      const mockBookings: MockBooking[] = [
        {
          id: '123',
          userId: '5',
          hotelName: 'Test Hotel',
          hotelAddress: '123 Test Street, Test City',
          checkInDate: '2025-08-20',
          checkOutDate: '2025-08-22',
          status: 'Confirmed',
          createdAt: '2025-08-01T00:00:00Z',
          numberOfNights: 2,
          numberOfRooms: 1,
          adults: 2,
          children: 0,
          totalAmount: 300
        }
      ];

      const mockUser: MockUser = { id: '5', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings,
      } as Response);

      renderWithRouter(<PastBookingPage />);

      await waitFor(() => {
        expect(screen.getByText('Booking History')).toBeInTheDocument();
        expect(screen.getByText('Test Hotel')).toBeInTheDocument();
        expect(screen.getByText(/123 Test Street, Test City/)).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument(); // Booking ID
        expect(screen.getByText('20 August 2025')).toBeInTheDocument();
        expect(screen.getByText('22 August 2025')).toBeInTheDocument();
        expect(screen.getByText(/2 nights/)).toBeInTheDocument();
        expect(screen.getByText(/1 Room, 2 Adults/)).toBeInTheDocument();
      });
    });
  });

  // TC_PASTBOOKING_2
  describe('TC_PASTBOOKING_2: User clicks on past booking card', () => {
    it('navigates to booking confirmation page when booking card is clicked', async () => {
      const mockBookings: MockBooking[] = [
        {
          id: '123',
          userId: '5',
          hotelName: 'Test Hotel',
          hotelAddress: 'Test Address',
          checkInDate: '2025-08-20',
          checkOutDate: '2025-08-22',
          status: 'Confirmed',
          createdAt: '2025-08-01T00:00:00Z',
          numberOfNights: 2,
          numberOfRooms: 1,
          adults: 2,
          children: 0,
          totalAmount: 300
        }
      ];

      const mockUser: MockUser = { id: '5', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings,
      } as Response);

      renderWithRouter(<PastBookingPage />);

      await waitFor(() => {
        const bookingCard = screen.getByText('Test Hotel').closest('div[style*="cursor: pointer"]');
        if (bookingCard) fireEvent.click(bookingCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/booking/confirmation', {
        state: { bookingId: '123' }
      });
    });
  });

  // TC_PASTBOOKING_3
  describe('TC_PASTBOOKING_3: Empty state display and navigation', () => {
    it('displays empty state when no bookings exist', async () => {
      const mockUser: MockUser = { id: '5', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderWithRouter(<PastBookingPage />);

      await waitFor(() => {
        expect(screen.getByText('Ready for your next adventure?')).toBeInTheDocument();
        expect(screen.getByText(/You haven't made any hotel bookings yet/)).toBeInTheDocument();
        expect(screen.getByText('Start Searching')).toBeInTheDocument();
      });
    });

    it('navigates to listing page when Start Searching button is clicked', async () => {
      const mockUser: MockUser = { id: '5', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      renderWithRouter(<PastBookingPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Start Searching'));
      });

      expect(mockNavigate).toHaveBeenCalledWith('/listing');
    });
  });

  // TC_PASTBOOKING_4
  describe('TC_PASTBOOKING_4: Test formatDate function', () => {
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? "N/A"
        : new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(date);
    };
    
    it('returns formatted date for valid date string', () => {
      expect(formatDate('2025-08-20')).toBe('20 August 2025'); 
    });

    it('returns "N/A" for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('N/A');
    });

    it('returns "N/A" for null date string', () => {
      expect(formatDate(null)).toBe('N/A');
    });

    it('returns "N/A" for undefined date string', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });
  });

  // TC_PASTBOOKING_5
  describe('TC_PASTBOOKING_5: Error handling when API fails', () => {
    it('displays error message when booking fetch fails with 500 error', async () => {
      const mockUser: MockUser = { id: '5', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      fetchMock.mockRejectedValueOnce(new Error('Failed to fetch bookings'));

      renderWithRouter(<PastBookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch bookings/)).toBeInTheDocument();
      });
    });
  });

  // TC_PASTBOOKING_6
  describe('TC_PASTBOOKING_6: User views past booking page when not logged in', () => {
    it('displays error when user data is missing from localStorage', async () => {
      renderWithRouter(<PastBookingPage />);
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/Please log in to view your booking history/)).toBeInTheDocument();
      });
    });
  });

  // TC_PASTBOOKING_7
  describe('TC_PASTBOOKING_7: Loading state', () => {
    it('displays loading message when loadingState is true', () => {
      const mockUser: MockUser = { id: '5', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      fetchMock.mockImplementationOnce(() => new Promise(() => {}));
      renderWithRouter(<PastBookingPage />);
      expect(screen.getByText('Loading your booking history...')).toBeInTheDocument();
    });
  });
});
