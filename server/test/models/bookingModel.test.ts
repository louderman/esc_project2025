import { CreateBookingRequest } from '../../../types/Booking';
import { createBooking, getBookingById, sync, updateBooking } from '../../models/bookingModel';

describe('Booking Model', () => {
    beforeAll(async () => {
        await sync();
    });


    it('should create a new booking', async () => {
        const bookingData: CreateBookingRequest = {
            hotelId: 'hotel_123',
            hotelName: 'Test Hotel',
            checkInDate: '2024-01-01',
            checkOutDate: '2024-01-05',
            guests: '2',
            pricePerNight: 100,
            numberOfNights: 4,
            totalAmount: 400,
            whatsIncluded: ['Breakfast'],
            imageUrl: 'http://example.com/image.jpg',
        };
        const bookingId = await createBooking(bookingData);
        const booking = await getBookingById(bookingId);

        expect(booking).toBeDefined();
        expect(booking?.hotelName).toBe('Test Hotel');
    });

    it('should get a booking by ID', async () => {
        const bookingData: CreateBookingRequest = {
            hotelId: 'hotel_456',
            hotelName: 'Another Test Hotel',
            checkInDate: '2024-02-01',
            checkOutDate: '2024-02-05',
            guests: '1',
            pricePerNight: 150,
            numberOfNights: 4,
            totalAmount: 600,
            whatsIncluded: [],
            imageUrl: 'http://example.com/image2.jpg',
        };
        const bookingId = await createBooking(bookingData);
        const booking = await getBookingById(bookingId);

        expect(booking).toBeDefined();
        expect(booking?.id).toBe(bookingId);
    });

    it('should update a booking', async () => {
        const bookingData: CreateBookingRequest = {
            hotelId: 'hotel_789',
            hotelName: 'Update Test Hotel',
            checkInDate: '2024-03-01',
            checkOutDate: '2024-03-05',
            guests: '3',
            pricePerNight: 200,
            numberOfNights: 4,
            totalAmount: 800,
            whatsIncluded: ['All-inclusive'],
            imageUrl: 'http://example.com/image3.jpg',
        };
        const bookingId = await createBooking(bookingData);
        await updateBooking(bookingId, 'pi_789', 'confirmed');
        const booking = await getBookingById(bookingId);

        expect(booking?.status).toBe('confirmed');
        expect(booking?.paymentIntentId).toBe('pi_789');
    });

    it('should return null for a non-existent booking', async () => {
        const booking = await getBookingById('non_existent_id');
        expect(booking).toBeNull();
    });
});
