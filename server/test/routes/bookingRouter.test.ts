import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
import { getBookingById, sync as syncBooking } from '../../models/bookingModel';
import app from '../../server';

describe('Booking API', () => {
    beforeAll(async () => {
        await syncBooking();
    });

    it('should create a new booking', async () => {
        const bookingData: CreateBookingRequest = {
            userId: 'user_123',
            email: 'test@example.com',
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
            bookingAddress: '123 Test Street, Test City, Test Country',
        };

        const res = await request(app)
            .post('/api/bookings')
            .send(bookingData);

        expect(res.statusCode).toBe(201);
        expect(res.body.bookingId).toBeDefined();

        const booking = await getBookingById(res.body.bookingId);
        expect(booking).toBeDefined();
        expect(booking?.hotelName).toBe('Test Hotel');
    });

    it('should get a booking by ID', async () => {
        const bookingData: CreateBookingRequest = {
            userId: 'user_456',
            email: 'test2@example.com',
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
            bookingAddress: '456 Test Avenue, Test City, Test Country',
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
            email: 'test3@example.com',
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
            bookingAddress: '789 Test Boulevard, Test City, Test Country',
        };
        const createRes = await request(app)
            .post('/api/bookings')
            .send(bookingData);
        const bookingId = createRes.body.bookingId;

        const res = await request(app)
            .put(`/api/bookings/${bookingId}`)
            .send({
                paymentIntentId: 'pi_456',
                status: 'confirmed',
            });

        expect(res.statusCode).toBe(200);

        const booking = await getBookingById(bookingId);
        expect(booking?.status).toBe('confirmed');
        expect(booking?.paymentIntentId).toBe('pi_456');
    });
});
