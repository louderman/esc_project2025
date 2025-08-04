import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
import { createBooking, getBookingById, sync as syncBooking } from '../../models/bookingModel';
import app from '../../server';

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => {
        return {
            paymentIntents: {
                create: jest.fn().mockResolvedValue({
                    id: 'pi_123',
                    status: 'succeeded',
                    client_secret: 'pi_123_secret_456',
                }),
            },
        };
    });
});

describe('POST /api/payment/create-payment-intent', () => {
    beforeAll(async () => {
        await syncBooking();
    });

    it('should return a successful payment intent', async () => {
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

        const res = await request(app)
            .post('/api/payment/create-payment-intent')
            .send({
                paymentMethodId: 'pm_card_visa',
                amount: 40000,
                bookingId,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.payment_intent_id).toBe('pi_123');
        expect(res.body.booking_id).toBe(bookingId);

        const booking = await getBookingById(bookingId);
        expect(booking?.status).toBe('confirmed');
        expect(booking?.paymentIntentId).toBe('pi_123');
    });

    it('should return 400 if paymentMethodId is missing', async () => {
        const res = await request(app)
            .post('/api/payment/create-payment-intent')
            .send({
                amount: 40000,
                bookingId: 'bk_123',
            });

        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if amount is missing', async () => {
        const res = await request(app)
            .post('/api/payment/create-payment-intent')
            .send({
                paymentMethodId: 'pm_card_visa',
                bookingId: 'bk_123',
            });

        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if bookingId is missing', async () => {
        const res = await request(app)
            .post('/api/payment/create-payment-intent')
            .send({
                paymentMethodId: 'pm_card_visa',
                amount: 40000,
            });

        expect(res.statusCode).toBe(400);
    });
});
