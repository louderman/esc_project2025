import { Server } from 'http';
import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
import {
  createBooking,
  getBookingById,
  sync as syncBooking,
} from '../../models/bookingModel';
import app from '../../server';

let server: Server;

describe('POST /api/payment/confirm-payment', () => {
  beforeAll(async () => {
    await syncBooking();
    server = app.listen(0); // Use port 0 for random available port
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should confirm payment and update booking status', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user_123',
      destinationId: 'dest_123',
      hotelId: 'hotel_123',
      hotelName: 'Test Hotel',
      hotelAddress: '123 Test Street, Test City, Test Country',
      imageUrl: 'http://example.com/image.jpg',
      checkInDate: '2024-01-01',
      checkOutDate: '2024-01-05',
      numberOfNights: 4,
      numberOfRooms: 1,
      adults: 2,
      children: 0,
      roomTypes: ['Standard'],
      messageToHotel: 'Test message',
      pricePerNight: 100,
      totalAmount: 400,
      whatsIncluded: ['Breakfast'],
      guestInformation: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        emailAddress: 'test@example.com',
        specialRequests: 'Late check-in please'
      }
    };
    const bookingId = await createBooking(bookingData);

    const res = await request(app).post('/api/payment/confirm-payment').send({
      bookingId,
      paymentIntentId: 'pi_test_123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking_id).toBe(bookingId);
    expect(res.body.message).toBe(
      'Payment confirmed and booking updated successfully'
    );

    const booking = await getBookingById(bookingId);
    expect(booking?.status).toBe('confirmed');
    expect(booking?.paymentInformation.paymentIntentId).toBe('pi_test_123');
  });

  it('should return 400 if bookingId is missing', async () => {
    const res = await request(app).post('/api/payment/confirm-payment').send({
      paymentIntentId: 'pi_test_123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing booking ID');
  });

  it('should return 400 if paymentIntentId is missing', async () => {
    const res = await request(app).post('/api/payment/confirm-payment').send({
      bookingId: 'BK_TEST_123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing payment intent ID');
  });

  it('should return 500 for non-existent booking', async () => {
    const res = await request(app).post('/api/payment/confirm-payment').send({
      bookingId: 'BK_NONEXISTENT_123',
      paymentIntentId: 'pi_test_123',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to confirm payment and update booking');
    expect(res.body.details).toBe('Booking not found or no changes made');
  });
});