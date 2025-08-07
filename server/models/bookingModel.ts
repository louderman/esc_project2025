import { BookingData, CreateBookingRequest } from '../../types/Booking';
import { pool } from '../database/db';

const tableName = 'bookings';

async function sync() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id VARCHAR(255) PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
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
      bookingAddress TEXT NOT NULL,
      paymentIntentId VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      createdAt DATETIME NOT NULL
    );
  `);
}

async function createBooking(bookingData: CreateBookingRequest): Promise<string> {
    // Validate required fields
    if (!bookingData.userId || !bookingData.email) {
        throw new Error('Missing required user fields: userId or email');
    }

    if (!bookingData.hotelId || !bookingData.hotelName || !bookingData.checkInDate || !bookingData.checkOutDate) {
        throw new Error('Missing required booking fields: hotelId, hotelName, checkInDate, or checkOutDate');
    }

    if (!bookingData.guests || bookingData.pricePerNight <= 0 || bookingData.numberOfNights <= 0 || bookingData.totalAmount <= 0) {
        throw new Error('Invalid booking data: guests, prices, or nights must be valid positive values');
    }

    if (!bookingData.bookingAddress) {
        throw new Error('Missing required booking address');
    }

    const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date();
    const status = 'pending';

    const newBooking: BookingData = {
        id: bookingId,
        ...bookingData,
        status,
        createdAt,
    };

    try {
        await pool.query(
            `INSERT INTO ${tableName} (id, userId, email, hotelId, hotelName, checkInDate, checkOutDate, guests, pricePerNight, numberOfNights, totalAmount, whatsIncluded, imageUrl, bookingAddress, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newBooking.id,
                newBooking.userId,
                newBooking.email,
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
                newBooking.bookingAddress,
                newBooking.status,
                newBooking.createdAt,
            ]
        );

        return bookingId;
    } catch (error) {
        console.error('Database error creating booking:', error);
        throw new Error('Failed to create booking in database');
    }
}

async function getBookingById(bookingId: string): Promise<BookingData | null> {
    if (!bookingId) {
        throw new Error('Booking ID is required');
    }

    try {
        const [rows]: any = await pool.query(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`, [bookingId]);
        if (rows.length > 0) {
            const booking = rows[0];
            try {
                booking.whatsIncluded = JSON.parse(booking.whatsIncluded);
            } catch (parseError) {
                console.error('Error parsing whatsIncluded JSON:', parseError);
                booking.whatsIncluded = [];
            }
            return booking;
        }
        return null;
    } catch (error) {
        console.error('Database error fetching booking:', error);
        throw new Error('Failed to fetch booking from database');
    }
}

async function updateBooking(bookingId: string, paymentIntentId: string, status: 'confirmed' | 'cancelled') {
    if (!bookingId) {
        throw new Error('Booking ID is required');
    }

    if (!paymentIntentId) {
        throw new Error('Payment Intent ID is required');
    }

    if (!['confirmed', 'cancelled'].includes(status)) {
        throw new Error('Invalid status. Must be "confirmed" or "cancelled"');
    }

    try {
        // First check if the booking exists
        const [existingRows]: any = await pool.query(`SELECT id FROM ${tableName} WHERE id = ? LIMIT 1`, [bookingId]);
        
        if (existingRows.length === 0) {
            throw new Error('Booking not found or no changes made');
        }

        // Now perform the update
        const result: any = await pool.query(
            `UPDATE ${tableName} SET paymentIntentId = ?, status = ? WHERE id = ?`,
            [paymentIntentId, status, bookingId]
        );


        return result;
    } catch (error) {
        console.error('Database error updating booking:', error);
        if (error instanceof Error && error.message.includes('Booking not found')) {
            throw error; // Re-throw the specific error
        }
        throw new Error('Failed to update booking in database');
    }
}

export { createBooking, getBookingById, sync, updateBooking };
