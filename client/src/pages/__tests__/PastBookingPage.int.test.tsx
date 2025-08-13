import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PastBookingPage from '../PastBookingPage';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderPage = () => render(
  <BrowserRouter>
    <PastBookingPage />
  </BrowserRouter>
);

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  (global.fetch as any) = vi.fn();
});

describe('ITC_PASTBOOKING_1: Display bookings and navigate to booking confirmation page', () => {
  it('renders bookings with correct details and navigates on click', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'user123' }));

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'booking123',
          userId: 'user123',
          hotelName: 'Grand Hotel',
          hotelAddress: '456 Hotel Street',
          checkInDate: '2025-08-20',
          checkOutDate: '2025-08-22',
          status: 'Confirmed',
          imageUrl: '/hotel.jpg',
          createdAt: '2025-08-01T00:00:00Z',
          numberOfNights: 2,
          numberOfRooms: 1,
          adults: 2,
          children: 0,
          totalAmount: 500,
        }
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Booking History')).toBeInTheDocument();
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
      expect(screen.getByText(/456 Hotel Street/)).toBeInTheDocument();
      // expect(screen.getByText(/Booking ID/)).toBeInTheDocument();
      expect(screen.getByText('booking123', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('20 August 2025')).toBeInTheDocument();
      expect(screen.getByText('22 August 2025')).toBeInTheDocument();
      expect(screen.getByText(/2 nights/)).toBeInTheDocument();
      expect(screen.getByText(/1 Room, 2 Adults/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Grand Hotel').closest('div[style*="cursor: pointer"]')!);
    expect(mockNavigate).toHaveBeenCalledWith('/booking/confirmation', { state: { bookingId: 'booking123' } });
  });
});

describe('ITC_PASTBOOKING_2: Display empty state and navigation to hotel listing page', () => {
  it('renders empty state and navigates when clicking button', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'userEmpty' }));

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ready for your next adventure?')).toBeInTheDocument();
      // expect(screen.getByText(/You haven't made any hotel bookings yet/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start Searching'));
    expect(mockNavigate).toHaveBeenCalledWith('/listing');
  });
});
