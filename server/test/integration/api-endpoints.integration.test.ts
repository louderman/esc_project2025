import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
import { cleanup } from '../../database/db';
import { sync as syncBooking } from '../../models/bookingModel';
import app from '../../server';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_api_integration_test',
          status: 'succeeded',
          client_secret: 'pi_api_integration_test_secret',
        }),
      },
    };
  });
});

// Helper function to create booking data with required fields
const createBookingData = (
  overrides: Partial<CreateBookingRequest> = {}
): CreateBookingRequest => ({
  userId: 'user-api-123',
  destinationId: undefined,
  hotelId: 'hotel_api_test_123',
  hotelName: 'API Test Hotel',
  hotelAddress: '123 API Test St, API City, AC 12345, US',
  imageUrl: 'http://example.com/api-test-hotel.jpg',
  checkInDate: '2024-12-01',
  checkOutDate: '2024-12-05',
  numberOfNights: 4,
  numberOfRooms: 1,
  adults: 2,
  children: 1,
  roomTypes: ['Standard'],
  messageToHotel: undefined,
  pricePerNight: 200,
  totalAmount: 800,
  whatsIncluded: ['Breakfast', 'WiFi', 'Pool'],
  guestInformation: {
    firstName: 'Api',
    lastName: 'Tester',
    phoneNumber: '+1000000000',
    emailAddress: 'api-test@example.com'
  },
  ...overrides,
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('API Endpoints Integration Tests', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await syncBooking();
  });

  afterAll(async () => {
    // Give time for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    // Clean up database connections
    await cleanup();
  });

  describe('Complete API Flow', () => {
    it('should handle complete booking lifecycle through API endpoints', async () => {
      const bookingData = createBookingData();

      // Step 1: Create booking
      const createResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(createResponse.body.bookingId).toBeDefined();
      expect(createResponse.body.bookingId).toMatch(/^BK\d+/);

      const bookingId = createResponse.body.bookingId;

      // Step 2: Retrieve booking to verify creation
      const getResponse = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(bookingId);
      expect(getResponse.body.userId).toBe('user-api-123');
      expect(getResponse.body.hotelId).toBe('hotel_api_test_123');
      expect(getResponse.body.hotelName).toBe('API Test Hotel');
      expect(getResponse.body.status).toBe('pending');
      expect(getResponse.body.totalAmount).toBe(800);
      expect(getResponse.body.hotelAddress).toBe('123 API Test St, API City, AC 12345, US');
      expect(getResponse.body.guestInformation.emailAddress).toBe('api-test@example.com');

      // Step 3: Confirm payment
      const confirmResponse = await request(app)
        .post('/api/payment/confirm-payment')
        .send({
          bookingId,
          paymentIntentId: 'pi_api_integration_test',
        })
        .expect(200);

      expect(confirmResponse.body).toMatchObject({
        success: true,
        booking_id: bookingId,
        message: 'Payment confirmed and booking updated successfully',
      });

      // Step 4: Verify booking status was updated
      const updatedBookingResponse = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(updatedBookingResponse.body.id).toBe(bookingId);
      expect(updatedBookingResponse.body.status).toBe('confirmed');
      expect(updatedBookingResponse.body.paymentInformation.paymentIntentId).toBe('pi_api_integration_test');
    });
  });

  describe('Error Handling Across Endpoints', () => {
    it('should handle invalid booking data consistently', async () => {
      const invalidBookingData = createBookingData({
        hotelId: '', // Invalid
        pricePerNight: -100, // Invalid
        numberOfNights: 0, // Invalid
        totalAmount: 0, // Invalid
      });

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle non-existent booking retrieval', async () => {
      const response = await request(app)
        .get('/api/bookings/BK_NONEXISTENT_123')
        .expect(404);

      expect(response.body.error).toBe('Booking not found');
    });

    it('should handle payment confirmation for non-existent booking', async () => {
      const response = await request(app)
        .post('/api/payment/confirm-payment')
        .send({
          bookingId: 'BK_NONEXISTENT_456',
          paymentIntentId: 'pi_test_123',
        })
        .expect(500);

      expect(response.body.error).toBe(
        'Failed to confirm payment and update booking'
      );
    });
  });

  describe('Data Validation Across Endpoints', () => {
    it('should validate booking data fields consistently', async () => {
      const testCases = [
        {
          name: 'missing userId',
          data: createBookingData({ userId: '' }),
          expectedError: /userId/,
        },
        {
          name: 'missing guest emailAddress',
          data: createBookingData({
            guestInformation: {
              firstName: 'Api',
              lastName: 'Tester',
              phoneNumber: '+1000000000',
              emailAddress: ''
            }
          }),
          expectedError: /emailAddress/,
        },
        {
          name: 'missing hotelId',
          data: createBookingData({ hotelId: '' }),
          expectedError: /hotelId/,
        },
        {
          name: 'missing hotelName',
          data: createBookingData({ hotelName: '' }),
          expectedError: /hotelName/,
        },
        {
          name: 'invalid pricePerNight',
          data: createBookingData({ pricePerNight: -50 }),
          expectedError: /positive values/,
        },
        {
          name: 'missing hotelAddress',
          data: createBookingData({ hotelAddress: '' }),
          expectedError: /hotelAddress/,
        },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/bookings')
          .send(testCase.data)
          .expect(400);

        expect(response.body.error).toMatch(testCase.expectedError);
      }
    });

    it('should validate payment confirmation parameters', async () => {
      const testCases = [
        {
          name: 'missing bookingId',
          data: { paymentIntentId: 'pi_test_123' },
          expectedStatus: 400,
          expectedError: 'Missing booking ID',
        },
        {
          name: 'missing paymentIntentId',
          data: { bookingId: 'BK_TEST_123' },
          expectedStatus: 400,
          expectedError: 'Missing payment intent ID',
        },
        {
          name: 'empty bookingId',
          data: { bookingId: '', paymentIntentId: 'pi_test_123' },
          expectedStatus: 400,
          expectedError: 'Missing booking ID',
        },
        {
          name: 'empty paymentIntentId',
          data: { bookingId: 'BK_TEST_123', paymentIntentId: '' },
          expectedStatus: 400,
          expectedError: 'Missing payment intent ID',
        },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/payment/confirm-payment')
          .send(testCase.data)
          .expect(testCase.expectedStatus);

        expect(response.body.error).toBe(testCase.expectedError);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous booking operations', async () => {
      const bookingPromises = Array.from({ length: 10 }, (_, i) => {
        const bookingData = createBookingData({
          userId: `user-concurrent-api-${i}`,
          hotelId: `hotel_concurrent_api_${i}`,
          hotelName: `Concurrent API Test Hotel ${i}`,
          hotelAddress: `${100 + i} Concurrent St, Concurrent City, CC ${12345 + i}, US`,
          imageUrl: `http://example.com/hotel${i}.jpg`,
          numberOfRooms: 1,
          adults: 1,
          children: 0,
          roomTypes: ['Standard'],
          pricePerNight: 100 + i * 10,
          totalAmount: (100 + i * 10) * 4,
          whatsIncluded: [`Feature ${i}`],
          guestInformation: {
            firstName: `User${i}`,
            lastName: 'Concurrent',
            phoneNumber: '+1000000000',
            emailAddress: `concurrent${i}@example.com`
          }
        });

        return request(app).post('/api/bookings').send(bookingData);
      });

      const results = await Promise.all(bookingPromises);

      // All should succeed
      results.forEach((result, i) => {
        expect(result.status).toBe(201);
        expect(result.body.bookingId).toBeDefined();
      });

      // All booking IDs should be unique
      const bookingIds = results.map((result) => result.body.bookingId);
      const uniqueIds = new Set(bookingIds);
      expect(uniqueIds.size).toBe(bookingIds.length);

      // Verify all bookings can be retrieved
      const retrievalPromises = bookingIds.map((id) =>
        request(app).get(`/api/bookings/${id}`)
      );

      const retrievalResults = await Promise.all(retrievalPromises);
      retrievalResults.forEach((result, i) => {
        expect(result.status).toBe(200);
        expect(result.body.id).toBe(bookingIds[i]);
        expect(result.body.hotelName).toBe(`Concurrent API Test Hotel ${i}`);
        expect(result.body.userId).toBe(`user-concurrent-api-${i}`);
        expect(result.body.guestInformation.emailAddress).toBe(`concurrent${i}@example.com`);
      });
    });

    it('should handle concurrent payment confirmations', async () => {
      // First create multiple bookings
      const bookingPromises = Array.from({ length: 5 }, (_, i) => {
        const bookingData = createBookingData({
          userId: `user-payment-concurrent-${i}`,
          hotelId: `hotel_payment_concurrent_${i}`,
          hotelName: `Payment Concurrent Test Hotel ${i}`,
          hotelAddress: `${200 + i} Payment St, Payment City, PC ${54321 + i}, US`,
          guestInformation: {
            firstName: `Pay${i}`,
            lastName: 'User',
            phoneNumber: '+1000000001',
            emailAddress: `payment${i}@example.com`
          }
        });

        return request(app).post('/api/bookings').send(bookingData);
      });

      const bookingResults = await Promise.all(bookingPromises);
      const bookingIds = bookingResults.map((result) => result.body.bookingId);

      // Now confirm payments concurrently
      const paymentPromises = bookingIds.map((bookingId, i) =>
        request(app)
          .post('/api/payment/confirm-payment')
          .send({
            bookingId,
            paymentIntentId: `pi_concurrent_test_${i}`,
          })
      );

      const paymentResults = await Promise.all(paymentPromises);

      // All payments should succeed
      paymentResults.forEach((result, i) => {
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.booking_id).toBe(bookingIds[i]);
      });

      // Verify all bookings are confirmed
      const verificationPromises = bookingIds.map((id) =>
        request(app).get(`/api/bookings/${id}`)
      );

      const verificationResults = await Promise.all(verificationPromises);
      verificationResults.forEach((result, i) => {
        expect(result.status).toBe(200);
        expect(result.body.status).toBe('confirmed');
        expect(result.body.paymentInformation.paymentIntentId).toBe(`pi_concurrent_test_${i}`);
        expect(result.body.userId).toBe(`user-payment-concurrent-${i}`);
        expect(result.body.guestInformation.emailAddress).toBe(`payment${i}@example.com`);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large booking amounts', async () => {
      const bookingData = createBookingData({
        userId: 'user-large-amount',
        hotelId: 'hotel_large_amount',
        hotelName: 'Large Amount Test Hotel',
        checkInDate: '2024-12-01',
        checkOutDate: '2024-12-31',
        adults: 10,
        children: 0,
        pricePerNight: 5000,
        numberOfNights: 30,
        totalAmount: 150000, // $5,000 per night for 30 nights
        whatsIncluded: ['Presidential Suite', 'All Services'],
        imageUrl: 'http://example.com/luxury-hotel.jpg',
        hotelAddress: '1 Luxury Ave, Luxury City, LC 99999, US',
        guestInformation: {
          firstName: 'Large',
          lastName: 'Spender',
          phoneNumber: '+1999999999',
          emailAddress: 'large@example.com'
        }
      });

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201)
      expect(response.body.bookingId).toBeDefined();

      // Verify the booking was created with correct amount
      const getResponse = await request(app)
        .get(`/api/bookings/${response.body.bookingId}`)
        .expect(200);

    });

    it('should handle special characters in booking data', async () => {
      const bookingData = createBookingData({
        userId: 'user-special-chars',
        hotelId: 'hotel_special_chars',
        hotelName: 'Hôtel Spéciál & Resort™',
        hotelAddress: '123 Spéciál St, Ünique City, UC 12345, US',
        adults: 2,
        children: 1,
        whatsIncluded: ['Café & Restaurant', 'Spa & Wellness'],
        imageUrl: 'http://example.com/special-hotel.jpg',
        guestInformation: {
          firstName: 'Spéciál',
          lastName: 'Üser',
          phoneNumber: '+1234567890',
          emailAddress: 'special@exämple.com'
        }
      });

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      const getResponse = await request(app)
        .get(`/api/bookings/${response.body.bookingId}`)
        .expect(200);

      expect(getResponse.body.hotelName).toBe('Hôtel Spéciál & Resort™');
      expect(getResponse.body.adults).toBe(2);
      expect(getResponse.body.children).toBe(1);
      expect(getResponse.body.userId).toBe('user-special-chars');
      expect(getResponse.body.guestInformation.emailAddress).toBe('special@exämple.com');
      expect(getResponse.body.hotelAddress).toBe(
        '123 Spéciál St, Ünique City, UC 12345, US'
      );
    });
  });
});