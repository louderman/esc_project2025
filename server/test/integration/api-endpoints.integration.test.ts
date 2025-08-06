import request from 'supertest';
import { CreateBookingRequest } from '../../../types/Booking';
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

describe('API Endpoints Integration Tests', () => {
    beforeAll(async () => {
        await syncBooking();
    });

    describe('Complete API Flow', () => {
        it('should handle complete booking lifecycle through API endpoints', async () => {
            const bookingData: CreateBookingRequest = {
                hotelId: 'hotel_api_test_123',
                hotelName: 'API Test Hotel',
                checkInDate: '2024-12-01',
                checkOutDate: '2024-12-05',
                guests: '2 adults, 1 child',
                pricePerNight: 200,
                numberOfNights: 4,
                totalAmount: 800,
                whatsIncluded: ['Breakfast', 'WiFi', 'Pool'],
                imageUrl: 'http://example.com/api-test-hotel.jpg',
            };

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

            expect(getResponse.body).toMatchObject({
                id: bookingId,
                hotelId: 'hotel_api_test_123',
                hotelName: 'API Test Hotel',
                status: 'pending',
                totalAmount: 800,
                paymentIntentId: null,
            });

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

            expect(updatedBookingResponse.body).toMatchObject({
                id: bookingId,
                status: 'confirmed',
                paymentIntentId: 'pi_api_integration_test',
            });
        });
    });

    describe('Error Handling Across Endpoints', () => {
        it('should handle invalid booking data consistently', async () => {
            const invalidBookingData = {
                hotelId: '', // Invalid
                hotelName: 'Test Hotel',
                checkInDate: '2024-12-01',
                checkOutDate: '2024-12-05',
                guests: '2',
                pricePerNight: -100, // Invalid
                numberOfNights: 0, // Invalid
                totalAmount: 0, // Invalid
                whatsIncluded: [],
                imageUrl: 'http://example.com/test.jpg',
            };

            const response = await request(app)
                .post('/api/bookings')
                .send(invalidBookingData)
                .expect(500);

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

            expect(response.body.error).toBe('Failed to confirm payment and update booking');
        });
    });

    describe('Data Validation Across Endpoints', () => {
        it('should validate booking data fields consistently', async () => {
            const testCases = [
                {
                    name: 'missing hotelId',
                    data: { hotelName: 'Test', checkInDate: '2024-12-01', checkOutDate: '2024-12-05', guests: '2', pricePerNight: 100, numberOfNights: 4, totalAmount: 400, whatsIncluded: [], imageUrl: 'test.jpg' },
                    expectedError: /hotelId/,
                },
                {
                    name: 'missing hotelName',
                    data: { hotelId: 'hotel123', checkInDate: '2024-12-01', checkOutDate: '2024-12-05', guests: '2', pricePerNight: 100, numberOfNights: 4, totalAmount: 400, whatsIncluded: [], imageUrl: 'test.jpg' },
                    expectedError: /hotelName/,
                },
                {
                    name: 'invalid pricePerNight',
                    data: { hotelId: 'hotel123', hotelName: 'Test', checkInDate: '2024-12-01', checkOutDate: '2024-12-05', guests: '2', pricePerNight: -50, numberOfNights: 4, totalAmount: 400, whatsIncluded: [], imageUrl: 'test.jpg' },
                    expectedError: /positive values/,
                },
            ];

            for (const testCase of testCases) {
                const response = await request(app)
                    .post('/api/bookings')
                    .send(testCase.data)
                    .expect(500);

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
                const bookingData: CreateBookingRequest = {
                    hotelId: `hotel_concurrent_api_${i}`,
                    hotelName: `Concurrent API Test Hotel ${i}`,
                    checkInDate: '2024-12-01',
                    checkOutDate: '2024-12-05',
                    guests: `${i + 1} guests`,
                    pricePerNight: 100 + i * 10,
                    numberOfNights: 4,
                    totalAmount: (100 + i * 10) * 4,
                    whatsIncluded: [`Feature ${i}`],
                    imageUrl: `http://example.com/hotel${i}.jpg`,
                };

                return request(app)
                    .post('/api/bookings')
                    .send(bookingData);
            });

            const results = await Promise.all(bookingPromises);

            // All should succeed
            results.forEach((result, i) => {
                expect(result.status).toBe(201);
                expect(result.body.bookingId).toBeDefined();
            });

            // All booking IDs should be unique
            const bookingIds = results.map(result => result.body.bookingId);
            const uniqueIds = new Set(bookingIds);
            expect(uniqueIds.size).toBe(bookingIds.length);

            // Verify all bookings can be retrieved
            const retrievalPromises = bookingIds.map(id => 
                request(app).get(`/api/bookings/${id}`)
            );

            const retrievalResults = await Promise.all(retrievalPromises);
            retrievalResults.forEach((result, i) => {
                expect(result.status).toBe(200);
                expect(result.body.id).toBe(bookingIds[i]);
                expect(result.body.hotelName).toBe(`Concurrent API Test Hotel ${i}`);
            });
        });

        it('should handle concurrent payment confirmations', async () => {
            // First create multiple bookings
            const bookingPromises = Array.from({ length: 5 }, (_, i) => {
                const bookingData: CreateBookingRequest = {
                    hotelId: `hotel_payment_concurrent_${i}`,
                    hotelName: `Payment Concurrent Test Hotel ${i}`,
                    checkInDate: '2024-12-01',
                    checkOutDate: '2024-12-05',
                    guests: '2',
                    pricePerNight: 150,
                    numberOfNights: 4,
                    totalAmount: 600,
                    whatsIncluded: ['Test'],
                    imageUrl: `http://example.com/payment${i}.jpg`,
                };

                return request(app)
                    .post('/api/bookings')
                    .send(bookingData);
            });

            const bookingResults = await Promise.all(bookingPromises);
            const bookingIds = bookingResults.map(result => result.body.bookingId);

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
            const verificationPromises = bookingIds.map(id => 
                request(app).get(`/api/bookings/${id}`)
            );

            const verificationResults = await Promise.all(verificationPromises);
            verificationResults.forEach((result, i) => {
                expect(result.status).toBe(200);
                expect(result.body.status).toBe('confirmed');
                expect(result.body.paymentIntentId).toBe(`pi_concurrent_test_${i}`);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large booking amounts', async () => {
            const bookingData: CreateBookingRequest = {
                hotelId: 'hotel_large_amount',
                hotelName: 'Large Amount Test Hotel',
                checkInDate: '2024-12-01',
                checkOutDate: '2024-12-31',
                guests: '10 guests',
                pricePerNight: 5000,
                numberOfNights: 30,
                totalAmount: 150000, // $1,500 per night for 30 nights
                whatsIncluded: ['Presidential Suite', 'All Services'],
                imageUrl: 'http://example.com/luxury-hotel.jpg',
            };

            const response = await request(app)
                .post('/api/bookings')
                .send(bookingData)
                .expect(201);

            expect(response.body.bookingId).toBeDefined();

            // Verify the booking was created with correct amount
            const getResponse = await request(app)
                .get(`/api/bookings/${response.body.bookingId}`)
                .expect(200);

            expect(getResponse.body.totalAmount).toBe(150000);
        });

        it('should handle special characters in booking data', async () => {
            const bookingData: CreateBookingRequest = {
                hotelId: 'hotel_special_chars',
                hotelName: 'Hôtel Spéciál & Resort™',
                checkInDate: '2024-12-01',
                checkOutDate: '2024-12-05',
                guests: '2 adults & 1 child',
                pricePerNight: 200,
                numberOfNights: 4,
                totalAmount: 800,
                whatsIncluded: ['Café & Restaurant', 'Spa & Wellness'],
                imageUrl: 'http://example.com/special-hotel.jpg',
            };

            const response = await request(app)
                .post('/api/bookings')
                .send(bookingData)
                .expect(201);

            const getResponse = await request(app)
                .get(`/api/bookings/${response.body.bookingId}`)
                .expect(200);

            expect(getResponse.body.hotelName).toBe('Hôtel Spéciál & Resort™');
            expect(getResponse.body.guests).toBe('2 adults & 1 child');
        });
    });
});
