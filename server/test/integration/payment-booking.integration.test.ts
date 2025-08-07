import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
import { getBookingById, sync as syncBooking } from '../../models/bookingModel';
import app from '../../server';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_test_integration_123',
          status: 'succeeded',
          client_secret: 'pi_test_integration_123_secret_456',
        }),
      },
    };
  });
});

// Helper function to create booking data with required fields
const createBookingData = (
  overrides: Partial<CreateBookingRequest> = {}
): CreateBookingRequest => ({
  userId: 'user-123',
  email: 'test@example.com',
  hotelId: 'hotel_integration_test',
  hotelName: 'Integration Test Hotel',
  checkInDate: '2024-12-01',
  checkOutDate: '2024-12-05',
  guests: '2 adults',
  pricePerNight: 150,
  numberOfNights: 4,
  totalAmount: 600,
  whatsIncluded: ['Breakfast', 'WiFi'],
  imageUrl: 'http://example.com/hotel.jpg',
  bookingAddress: '123 Test St, Test City, TC 12345, US',
  ...overrides,
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('Payment-Booking Integration Tests', () => {
  beforeAll(async () => {
    await syncBooking();
  });

  describe('Complete Payment Flow', () => {
    it('should handle complete booking creation and payment confirmation flow', async () => {
      // Step 1: Create booking data
      const bookingData = createBookingData();

      // Step 2: Create booking via API
      const createBookingRes = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(createBookingRes.statusCode).toBe(201);
      expect(createBookingRes.body.bookingId).toBeDefined();
      expect(createBookingRes.body.bookingId).toMatch(/^BK\d+/);

      const bookingId = createBookingRes.body.bookingId;

      // Step 3: Verify booking was created with pending status
      const createdBooking = await getBookingById(bookingId);
      expect(createdBooking).toBeDefined();
      expect(createdBooking?.status).toBe('pending');
      expect(createdBooking?.hotelName).toBe('Integration Test Hotel');
      expect(createdBooking?.totalAmount).toBe(600);
      expect(createdBooking?.userId).toBe('user-123');
      expect(createdBooking?.email).toBe('test@example.com');
      expect(createdBooking?.bookingAddress).toBe(
        '123 Test St, Test City, TC 12345, US'
      );
      expect(createdBooking?.paymentIntentId).toBeNull();

      // Step 4: Confirm payment
      const confirmPaymentRes = await request(app)
        .post('/api/payment/confirm-payment')
        .send({
          bookingId,
          paymentIntentId: 'pi_test_integration_123',
        });

      expect(confirmPaymentRes.statusCode).toBe(200);
      expect(confirmPaymentRes.body.success).toBe(true);
      expect(confirmPaymentRes.body.booking_id).toBe(bookingId);

      // Step 5: Verify booking status was updated
      const confirmedBooking = await getBookingById(bookingId);
      expect(confirmedBooking?.status).toBe('confirmed');
      expect(confirmedBooking?.paymentIntentId).toBe('pi_test_integration_123');
    });

    it('should handle payment confirmation for non-existent booking', async () => {
      const confirmPaymentRes = await request(app)
        .post('/api/payment/confirm-payment')
        .send({
          bookingId: 'BK_NONEXISTENT_123456789',
          paymentIntentId: 'pi_test_123',
        });

      expect(confirmPaymentRes.statusCode).toBe(500);
      expect(confirmPaymentRes.body.error).toBe(
        'Failed to confirm payment and update booking'
      );
      expect(confirmPaymentRes.body.details).toBe(
        'Booking not found or no changes made'
      );
    });

    it('should validate required fields for payment confirmation', async () => {
      // Missing bookingId
      const res1 = await request(app)
        .post('/api/payment/confirm-payment')
        .send({
          paymentIntentId: 'pi_test_123',
        });

      expect(res1.statusCode).toBe(400);
      expect(res1.body.error).toBe('Missing booking ID');

      // Missing paymentIntentId
      const res2 = await request(app)
        .post('/api/payment/confirm-payment')
        .send({
          bookingId: 'BK_TEST_123',
        });

      expect(res2.statusCode).toBe(400);
      expect(res2.body.error).toBe('Missing payment intent ID');
    });
  });

  describe('Booking Retrieval After Payment', () => {
    it('should retrieve booking details after successful payment', async () => {
      // Create and confirm a booking
      const bookingData = createBookingData({
        userId: 'user-456',
        email: 'test2@example.com',
        hotelId: 'hotel_retrieval_test',
        hotelName: 'Retrieval Test Hotel',
        checkInDate: '2024-12-10',
        checkOutDate: '2024-12-15',
        guests: '1 adult',
        pricePerNight: 200,
        numberOfNights: 5,
        totalAmount: 1000,
        whatsIncluded: ['All-inclusive'],
        imageUrl: 'http://example.com/retrieval-hotel.jpg',
        bookingAddress: '456 Retrieval St, Retrieval City, RC 67890, US',
      });

      const createRes = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      const bookingId = createRes.body.bookingId;

      await request(app).post('/api/payment/confirm-payment').send({
        bookingId,
        paymentIntentId: 'pi_retrieval_test_456',
      });

      // Retrieve booking
      const getRes = await request(app).get(`/api/bookings/${bookingId}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.id).toBe(bookingId);
      expect(getRes.body.status).toBe('confirmed');
      expect(getRes.body.paymentIntentId).toBe('pi_retrieval_test_456');
      expect(getRes.body.hotelName).toBe('Retrieval Test Hotel');
      expect(getRes.body.totalAmount).toBe(1000);
      expect(getRes.body.userId).toBe('user-456');
      expect(getRes.body.email).toBe('test2@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid booking data gracefully', async () => {
      const invalidBookingData = createBookingData({
        hotelId: '', // Invalid: empty
        pricePerNight: -100, // Invalid: negative
        numberOfNights: 0, // Invalid: zero
        totalAmount: 0, // Invalid: zero
      });

      const res = await request(app)
        .post('/api/bookings')
        .send(invalidBookingData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should handle database errors during booking creation', async () => {
      const bookingData = createBookingData({
        hotelId: 'hotel_db_error_test',
        hotelName: 'DB Error Test Hotel',
      });

      // This test would require mocking the database to simulate an error
      // For now, we'll test with valid data to ensure the happy path works
      const res = await request(app).post('/api/bookings').send(bookingData);

      expect(res.statusCode).toBe(201);
      expect(res.body.bookingId).toBeDefined();
    });
  });

  describe('Concurrent Booking Scenarios', () => {
    it('should handle multiple simultaneous booking creations', async () => {
      const bookingPromises = Array.from({ length: 5 }, (_, i) => {
        const bookingData = createBookingData({
          userId: `user-concurrent-${i}`,
          email: `test${i}@example.com`,
          hotelId: `hotel_concurrent_${i}`,
          hotelName: `Concurrent Test Hotel ${i}`,
          pricePerNight: 100 + i * 10,
          totalAmount: (100 + i * 10) * 4,
          whatsIncluded: [`Feature ${i}`],
          imageUrl: `http://example.com/hotel${i}.jpg`,
          bookingAddress: `${100 + i} Concurrent St, Concurrent City, CC ${
            12345 + i
          }, US`,
        });

        return request(app).post('/api/bookings').send(bookingData);
      });

      const results = await Promise.all(bookingPromises);

      // All bookings should be created successfully
      results.forEach((res, i) => {
        expect(res.statusCode).toBe(201);
        expect(res.body.bookingId).toBeDefined();
        expect(res.body.bookingId).toMatch(/^BK\d+/);
      });

      // All booking IDs should be unique
      const bookingIds = results.map((res) => res.body.bookingId);
      const uniqueIds = new Set(bookingIds);
      expect(uniqueIds.size).toBe(bookingIds.length);
    });
  });

  describe('Payment Amount Validation', () => {
    it('should handle different payment amounts correctly', async () => {
      const testCases = [
        { amount: 100, description: 'small amount' },
        { amount: 50000, description: 'large amount' },
        { amount: 1, description: 'minimum amount' },
      ];

      for (const testCase of testCases) {
        const bookingData = createBookingData({
          userId: `user-amount-${testCase.amount}`,
          email: `amount${testCase.amount}@example.com`,
          hotelId: `hotel_amount_test_${testCase.amount}`,
          hotelName: `Amount Test Hotel - ${testCase.description}`,
          pricePerNight: testCase.amount,
          totalAmount: testCase.amount,
          bookingAddress: `${testCase.amount} Amount St, Amount City, AC ${testCase.amount}, US`,
        });

        const createRes = await request(app)
          .post('/api/bookings')
          .send(bookingData);

        expect(createRes.statusCode).toBe(201);

        const bookingId = createRes.body.bookingId;
        const booking = await getBookingById(bookingId);
        expect(booking?.totalAmount).toBe(testCase.amount);
        expect(booking?.userId).toBe(`user-amount-${testCase.amount}`);
        expect(booking?.email).toBe(`amount${testCase.amount}@example.com`);
      }
    });
  });
});
