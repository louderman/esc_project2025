import request from 'supertest';
import express from 'express';
import { router } from '../../routes/bookingHistoryRouter';
import { pool } from '../../database/db';

const app = express();
app.use('/api/booking-history', router);

interface TestBooking {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  whatsIncluded: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  hotelAddress?: string | null;
  numberOfRooms?: number | null;
  adults?: number | null;
  children?: number | null;
  paymentIntentId?: string | null;
}

const toMySQLDateTime = (isoString: string): string =>
  new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');

describe('ITC_BOOKINGHISTORYROUTER_1', () => {
  const testUserId = 'router-int-user';
  let insertedIds: string[] = [];

  beforeAll(async () => {
    const now = toMySQLDateTime(new Date().toISOString());

    const testBookings: TestBooking[] = [
      {
        id: 'router-int-1',
        userId: testUserId,
        hotelId: 'hotel-001',
        hotelName: 'Router Test Hotel 1',
        checkInDate: '2025-08-20',
        checkOutDate: '2025-08-22',
        pricePerNight: 150.0,
        numberOfNights: 2,
        totalAmount: 300.0,
        whatsIncluded: '["WiFi","Breakfast"]',
        imageUrl: '/router-image-1.jpg',
        status: 'confirmed',
        createdAt: now,
        hotelAddress: 'Router Test Address 1',
        numberOfRooms: 1,
        adults: 2,
        children: 0,
        paymentIntentId: 'pi_router_1'
      },
      {
        id: 'router-int-2',
        userId: testUserId,
        hotelId: 'hotel-002',
        hotelName: 'Router Test Hotel 2',
        checkInDate: '2025-09-10',
        checkOutDate: '2025-09-12',
        pricePerNight: 200.0,
        numberOfNights: 2,
        totalAmount: 400.0,
        whatsIncluded: '["WiFi","Pool"]',
        imageUrl: '/router-image-2.jpg',
        status: 'confirmed',
        createdAt: now,
        hotelAddress: 'Router Test Address 2',
        numberOfRooms: 2,
        adults: 3,
        children: 1,
        paymentIntentId: 'pi_router_2'
      },
      {
        id: 'router-int-3',
        userId: testUserId,
        hotelId: 'hotel-003',
        hotelName: 'Router Test Hotel 3',
        checkInDate: '2025-10-05',
        checkOutDate: '2025-10-07',
        pricePerNight: 120.0,
        numberOfNights: 2,
        totalAmount: 240.0,
        whatsIncluded: '["WiFi"]',
        imageUrl: '/router-image-3.jpg',
        status: 'pending',
        createdAt: now,
        hotelAddress: 'Router Test Address 3',
        numberOfRooms: 1,
        adults: 1,
        children: 0,
        paymentIntentId: 'pi_router_3'
      }
    ];

    for (const b of testBookings) {
      await pool.query(
        `INSERT INTO bookings
        (id, userId, hotelId, hotelName, checkInDate, checkOutDate,
        pricePerNight, numberOfNights, totalAmount, whatsIncluded,
        imageUrl, status, createdAt,
        hotelAddress, numberOfRooms, adults, children)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id,
          b.userId,
          b.hotelId,
          b.hotelName,
          b.checkInDate,
          b.checkOutDate,
          b.pricePerNight,
          b.numberOfNights,
          b.totalAmount,
          b.whatsIncluded,
          b.imageUrl,
          b.status,
          b.createdAt,
          b.hotelAddress ?? null,
          b.numberOfRooms ?? null,
          b.adults ?? null,
          b.children ?? null
        ]
      );
      insertedIds.push(b.id);
    }
  });

  afterAll(async () => {
    for (const id of insertedIds) {
      await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    }
    insertedIds = [];
  });

  test('Valid userId returns bookings with all required fields', async () => {
    const res = await request(app)
      .get(`/api/booking-history/history/${testUserId}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);

    const booking = res.body[0];
    expect(booking).toHaveProperty('id');
    expect(booking).toHaveProperty('userId', testUserId);
    expect(booking).toHaveProperty('hotelName');
    expect(booking).toHaveProperty('checkInDate');
    expect(booking).toHaveProperty('checkOutDate');
    expect(booking).toHaveProperty('status');
    expect(booking).toHaveProperty('imageUrl');
    expect(booking).toHaveProperty('createdAt');
    expect(booking).toHaveProperty('hotelAddress');
    expect(booking).toHaveProperty('numberOfNights');
    expect(booking).toHaveProperty('numberOfRooms');
    expect(booking).toHaveProperty('adults');
    expect(booking).toHaveProperty('children');
    expect(booking).toHaveProperty('totalAmount');
  });

  test('Null userId literal returns empty array', async () => {
    const res = await request(app)
      .get('/api/booking-history/history/null')
      .expect(200);
    expect(res.body).toEqual([]);
  });

  test('Undefined userId literal returns empty array', async () => {
    const res = await request(app)
      .get('/api/booking-history/history/undefined')
      .expect(200);
    expect(res.body).toEqual([]);
  });

  test('Database connection error during request returns 500', async () => {
    const spy = jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await request(app)
      .get(`/api/booking-history/history/${testUserId}`)
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to fetch bookings' });
    spy.mockRestore();
  });
});
