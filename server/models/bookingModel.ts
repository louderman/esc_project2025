import { BookingData, CreateBookingRequest } from '../../types/Booking';
import { pool } from '../database/db';

const tableName = 'bookings';

async function sync() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id VARCHAR(255) PRIMARY KEY,
      hotelId VARCHAR(255) NOT NULL,
      hotelName VARCHAR(255) NOT NULL,
      checkInDate VARCHAR(255) NOT NULL,
      checkOutDate VARCHAR(255) NOT NULL,
      guests VARCHAR(255) NOT NULL,
      pricePerNight FLOAT NOT NULL,
      numberOfNights INT NOT NULL,
      totalAmount FLOAT NOT NULL,
      whatsIncluded JSON NOT NULL,
      imageUrl TEXT NOT NULL,
      paymentIntentId VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      createdAt DATETIME NOT NULL
    );
  `);
}

async function createBooking(bookingData: CreateBookingRequest): Promise<string> {
    const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date();
    const status = 'pending';

    const newBooking: BookingData = {
        id: bookingId,
        ...bookingData,
        status,
        createdAt,
    };

    await pool.query(
        `INSERT INTO ${tableName} (id, hotelId, hotelName, checkInDate, checkOutDate, guests, pricePerNight, numberOfNights, totalAmount, whatsIncluded, imageUrl, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newBooking.id,
            newBooking.hotelId,
            newBooking.hotelName,
            newBooking.checkInDate,
            newBooking.checkOutDate,
            newBooking.guests,
            newBooking.pricePerNight,
            newBooking.numberOfNights,
            newBooking.totalAmount,
            JSON.stringify(newBooking.whatsIncluded),
            newBooking.imageUrl,
            newBooking.status,
            newBooking.createdAt,
        ]
    );

    return bookingId;
}

async function getBookingById(bookingId: string): Promise<BookingData | null> {
    const [rows]: any = await pool.query(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`, [bookingId]);
    if (rows.length > 0) {
        const booking = rows[0];
        booking.whatsIncluded = JSON.parse(booking.whatsIncluded);
        return booking;
    }
    return null;
}

async function updateBooking(bookingId: string, paymentIntentId: string, status: 'confirmed' | 'cancelled') {
    await pool.query(
        `UPDATE ${tableName} SET paymentIntentId = ?, status = ? WHERE id = ?`,
        [paymentIntentId, status, bookingId]
    );
}

export { createBooking, getBookingById, sync, updateBooking };

