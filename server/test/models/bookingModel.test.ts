import { CreateBookingRequest } from '../../../types/Booking';
import {
  createBooking,
  getBookingById,
  sync,
  updateBooking,
} from '../../models/bookingModel';

describe('Booking Model', () => {
  beforeAll(async () => {
    await sync();
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should create a new booking', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user-123',
      hotelId: 'hotel_123',
      hotelName: 'Test Hotel',
      hotelAddress: '123 Test St, Test City, TC 12345, US',
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
    const bookingId = await createBooking(bookingData);
    const booking = await getBookingById(bookingId);

    expect(booking).toBeDefined();
    expect(booking?.hotelName).toBe('Test Hotel');
    expect(booking?.userId).toBe('user-123');
    expect(booking?.guestInformation.emailAddress).toBe('test@example.com');
    expect(booking?.hotelAddress).toBe('123 Test St, Test City, TC 12345, US');
  });

  it('should get a booking by ID', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user-456',
      hotelId: 'hotel_456',
      hotelName: 'Another Test Hotel',
      hotelAddress: '456 Another St, Another City, AC 67890, US',
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
    const bookingId = await createBooking(bookingData);
    const booking = await getBookingById(bookingId);

    expect(booking).toBeDefined();
    expect(booking?.id).toBe(bookingId);
    expect(booking?.userId).toBe('user-456');
    expect(booking?.guestInformation.emailAddress).toBe('test2@example.com');
  });

  it('should update a booking', async () => {
    const bookingData: CreateBookingRequest = {
      userId: 'user-789',
      hotelId: 'hotel_789',
      hotelName: 'Update Test Hotel',
      hotelAddress: '789 Update St, Update City, UC 11111, US',
      imageUrl: 'http://example.com/image3.jpg',
      checkInDate: '2024-03-01',
      checkOutDate: '2024-03-05',
      numberOfNights: 4,
      numberOfRooms: 2,
      adults: 3,
      children: 1,
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
    const bookingId = await createBooking(bookingData);
    await updateBooking(bookingId, 'pi_789', 'confirmed');
    const booking = await getBookingById(bookingId);

    expect(booking?.status).toBe('confirmed');
    expect(booking?.paymentInformation.paymentIntentId).toBe('pi_789');
    expect(booking?.userId).toBe('user-789');
    expect(booking?.guestInformation.emailAddress).toBe('test3@example.com');
  });

  it('should return null for a non-existent booking', async () => {
    const booking = await getBookingById('non_existent_id');
    expect(booking).toBeNull();
  });
});