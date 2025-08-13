import { getBookingHistory } from '../../models/bookingHistoryModel';
import { pool } from '../../database/db';

// Mock the database module with proper TypeScript types
jest.mock('../../database/db', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Type the mocked pool for better TypeScript support
const mockedPool = pool as jest.Mocked<typeof pool>;

interface MockBooking {
  id: string;
  userId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  bookingAddress?: string;
}

describe('BookingHistory Model Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TC_BOOKINGHISTORYMODEL_1: getBookingHistory function', () => {
    test('returns array of booking objects for existing userId "5"', async () => {
      const mockBookings: MockBooking[] = [
        {
          id: '123',
          userId: '5',
          hotelName: 'Test Hotel',
          checkInDate: '2025-08-20',
          checkOutDate: '2025-08-22',
          status: 'Confirmed',
          imageUrl: '/test-image.jpg',
          createdAt: '2025-08-12T10:00:00Z',
          bookingAddress: 'Test Address'
        }
      ];

      // Mock the database query result with proper typing
      (mockedPool.query as jest.MockedFunction<any>).mockResolvedValueOnce([mockBookings]);

      const result = await getBookingHistory('5') as MockBooking[];

      expect(mockedPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE userId = ?'),
        ['5']
      );
      expect(result).toEqual(mockBookings);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns empty array for non-existing userId "100"', async () => {
      (mockedPool.query as jest.MockedFunction<any>).mockResolvedValueOnce([[]]);

      const result = await getBookingHistory('100');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('returns empty array when userId is null', async () => {
      // Cast null to the expected type to avoid TypeScript error
      const result = await getBookingHistory(null as any);

      expect(result).toEqual([]);
      expect(mockedPool.query).not.toHaveBeenCalled();
    });

    test('returns empty array when userId is undefined', async () => {
      const result = await getBookingHistory(undefined);

      expect(result).toEqual([]);
      expect(mockedPool.query).not.toHaveBeenCalled();
    });

    test('throws error when database query fails', async () => {
      (mockedPool.query as jest.MockedFunction<any>)
        .mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(getBookingHistory('5'))
        .rejects.toThrow('Failed to fetch bookings');
    });


  });
});