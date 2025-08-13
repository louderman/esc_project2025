import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
import { getBookingById, sync as syncBooking } from '../../models/bookingModel';
import app from '../../server';

describe('Booking API', () => {
  beforeAll(async () => {
    await syncBooking();
  });

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleErrorSpy && typeof consoleErrorSpy.mockRestore === 'function') {
      consoleErrorSpy.mockRestore();
    }
  });

  it('should create a new booking', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user_123',
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
      pricePerNight: 100,
      totalAmount: 400,
      whatsIncluded: ['Breakfast'],
      guestInformation: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        emailAddress: 'test@example.com',
        specialRequests: 'Late check-in'
      }
    };

    const res = await request(app).post('/api/bookings').send(bookingData);

    expect(res.statusCode).toBe(201);
    expect(res.body.bookingId).toBeDefined();

    const booking = await getBookingById(res.body.bookingId);
    expect(booking).toBeDefined();
    expect(booking?.hotelName).toBe('Test Hotel');
  });

  it('should get a booking by ID', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user_456',
      hotelId: 'hotel_456',
      hotelName: 'Another Test Hotel',
      hotelAddress: '456 Test Avenue, Test City, Test Country',
      imageUrl: 'http://example.com/image2.jpg',
      checkInDate: '2024-02-01',
      checkOutDate: '2024-02-05',
      numberOfNights: 4,
      numberOfRooms: 1,
      adults: 1,
      children: 0,
      roomTypes: ['Deluxe'],
      pricePerNight: 150,
      totalAmount: 600,
      whatsIncluded: [],
      guestInformation: {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1987654321',
        emailAddress: 'test2@example.com'
      }
    };
    const createRes = await request(app)
      .post('/api/bookings')
      .send(bookingData);
    const bookingId = createRes.body.bookingId;

    const res = await request(app).get(`/api/bookings/${bookingId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.hotelName).toBe('Another Test Hotel');
  });

  it('should update a booking', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user_789',
      hotelId: 'hotel_789',
      hotelName: 'Update Test Hotel',
      hotelAddress: '789 Test Boulevard, Test City, Test Country',
      imageUrl: 'http://example.com/image3.jpg',
      checkInDate: '2024-03-01',
      checkOutDate: '2024-03-05',
      numberOfNights: 4,
      numberOfRooms: 2,
      adults: 3,
      children: 0,
      roomTypes: ['Suite'],
      pricePerNight: 200,
      totalAmount: 800,
      whatsIncluded: ['All-inclusive'],
      guestInformation: {
        firstName: 'Bob',
        lastName: 'Johnson',
        phoneNumber: '+1122334455',
        emailAddress: 'test3@example.com',
        specialRequests: 'Ocean view room'
      }
    };
    const createRes = await request(app)
      .post('/api/bookings')
      .send(bookingData);
    const bookingId = createRes.body.bookingId;

    const res = await request(app).put(`/api/bookings/${bookingId}`).send({
      paymentIntentId: 'pi_456',
      status: 'confirmed',
    });

    expect(res.statusCode).toBe(200);

    const booking = await getBookingById(bookingId);
    expect(booking?.status).toBe('confirmed');
    expect(booking?.paymentInformation.paymentIntentId).toBe('pi_456');
  });
});