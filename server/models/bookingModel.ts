import {
  BookingData,
  CreateBookingRequest,
  GuestInformation
} from '../../types/Booking';
import { pool } from '../database/db';

const tableName = 'bookings';
const guestInfoTableName = 'guest_information';

async function sync() {
  // Create main bookings table with all required fields
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id VARCHAR(255) PRIMARY KEY,
      bookingReference VARCHAR(255) UNIQUE NOT NULL,
      userId VARCHAR(255) NOT NULL,
      destinationId VARCHAR(255),
      hotelId VARCHAR(255) NOT NULL,
      hotelName VARCHAR(255) NOT NULL,
      hotelAddress VARCHAR(500) NOT NULL DEFAULT '',
      imageUrl VARCHAR(1000),
      checkInDate VARCHAR(255) NOT NULL,
      checkOutDate VARCHAR(255) NOT NULL,
      numberOfNights INT NOT NULL DEFAULT 0,
      numberOfRooms INT NOT NULL DEFAULT 1,
      adults INT NOT NULL DEFAULT 1,
      children INT NOT NULL DEFAULT 0,
      roomTypes JSON NOT NULL DEFAULT (JSON_ARRAY('Standard')),
      messageToHotel VARCHAR(250),
      pricePerNight DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      whatsIncluded JSON NOT NULL DEFAULT (JSON_ARRAY()),
      selectedRoom JSON,
      paymentIntentId VARCHAR(255),
      payeeId VARCHAR(255),
      maskedCardNumber VARCHAR(20),
      cardExpiryDate VARCHAR(5),
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME,
      INDEX idx_booking_reference (bookingReference),
      INDEX idx_user_id (userId),
      INDEX idx_destination_id (destinationId),
      INDEX idx_hotel_id (hotelId),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Create guest information table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${guestInfoTableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bookingId VARCHAR(255) NOT NULL,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      phoneNumber VARCHAR(50) NOT NULL,
      emailAddress VARCHAR(255) NOT NULL,
      specialRequests VARCHAR(250),
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME,
      FOREIGN KEY (bookingId) REFERENCES ${tableName}(id) ON DELETE CASCADE,
      INDEX idx_booking_id (bookingId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Lightweight schema migration: ensure critical columns exist on existing tables
  // Avoids runtime errors like "Unknown column 'bookingReference' in 'INSERT INTO'"
  async function columnExists(table: string, column: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    return rows[0]?.count > 0;
  }

  async function ensureColumn(
    table: string,
    column: string,
    definition: string
  ): Promise<void> {
    if (!(await columnExists(table, column))) {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    }
  }

  // Ensure columns used by inserts/queries exist (use permissive defs to avoid failures on existing data)
  await ensureColumn(tableName, 'bookingReference', 'VARCHAR(255)');
  await ensureColumn(tableName, 'destinationId', 'VARCHAR(255)');
  await ensureColumn(tableName, 'hotelAddress', 'VARCHAR(500)');
  await ensureColumn(tableName, 'imageUrl', 'VARCHAR(1000)');
  await ensureColumn(tableName, 'checkInDate', 'VARCHAR(255)');
  await ensureColumn(tableName, 'checkOutDate', 'VARCHAR(255)');
  await ensureColumn(tableName, 'numberOfNights', 'INT');
  await ensureColumn(tableName, 'numberOfRooms', 'INT');
  await ensureColumn(tableName, 'adults', 'INT');
  await ensureColumn(tableName, 'children', 'INT');
  await ensureColumn(tableName, 'roomTypes', 'JSON');
  await ensureColumn(tableName, 'messageToHotel', 'VARCHAR(250)');
  await ensureColumn(tableName, 'pricePerNight', 'DECIMAL(10,2)');
  await ensureColumn(tableName, 'totalAmount', 'DECIMAL(10,2)');
  await ensureColumn(tableName, 'whatsIncluded', 'JSON');
  await ensureColumn(tableName, 'selectedRoom', 'JSON');
  await ensureColumn(tableName, 'status', "ENUM('pending','confirmed','cancelled')");
  await ensureColumn(tableName, 'createdAt', 'DATETIME');
  await ensureColumn(tableName, 'updatedAt', 'DATETIME');

  // Remove legacy columns that are no longer needed since we moved to compliant structure
  async function removeObsoleteColumns(): Promise<void> {
    // Remove legacy 'email' column - now stored in guest_information table
    if (await columnExists(tableName, 'email')) {
      try {
        await pool.query(`ALTER TABLE ${tableName} DROP COLUMN email;`);
        console.log('Schema migration: removed obsolete bookings.email column');
      } catch (err) {
        console.error('Schema migration: failed to remove bookings.email column', err);
      }
    }
    
    // Remove legacy 'guests' column - now stored as adults/children separately
    if (await columnExists(tableName, 'guests')) {
      try {
        await pool.query(`ALTER TABLE ${tableName} DROP COLUMN guests;`);
        console.log('Schema migration: removed obsolete bookings.guests column');
      } catch (err) {
        console.error('Schema migration: failed to remove bookings.guests column', err);
      }
    }
    
    // Remove legacy 'bookingAddress' column - now stored in billing information separately
    if (await columnExists(tableName, 'bookingAddress')) {
      try {
        await pool.query(`ALTER TABLE ${tableName} DROP COLUMN bookingAddress;`);
        console.log('Schema migration: removed obsolete bookings.bookingAddress column');
      } catch (err) {
        console.error('Schema migration: failed to remove bookings.bookingAddress column', err);
      }
    }
  }

  await removeObsoleteColumns();
}

// Helper function to generate booking reference
function generateBookingReference(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `BK${timestamp.slice(-6)}${random}`;
}

async function createBooking(bookingData: CreateBookingRequest): Promise<string> {
  // Validate required fields
  if (!bookingData.userId || !bookingData.guestInformation) {
    throw new Error('Missing required user fields: userId or guestInformation');
  }

  if (
    !bookingData.hotelId ||
    !bookingData.hotelName ||
    !bookingData.checkInDate ||
    !bookingData.checkOutDate
  ) {
    throw new Error(
      'Missing required booking fields: hotelId, hotelName, checkInDate, or checkOutDate'
    );
  }

  if (
    bookingData.pricePerNight <= 0 ||
    bookingData.numberOfNights <= 0 ||
    bookingData.totalAmount <= 0
  ) {
    throw new Error(
      'Invalid booking data: prices and nights must be valid positive values'
    );
  }

  if (!bookingData.hotelAddress) {
    throw new Error('Missing required hotel address');
  }

  // Validate guest information
  const guest = bookingData.guestInformation;
  if (!guest.firstName || !guest.lastName || !guest.phoneNumber || !guest.emailAddress) {
    throw new Error('Missing required guest information: firstName, lastName, phoneNumber, or emailAddress');
  }

  // Validate special requests length
  if (guest.specialRequests && guest.specialRequests.length > 250) {
    throw new Error('Special requests must be 250 characters or less');
  }

  // Validate message to hotel length
  if (bookingData.messageToHotel && bookingData.messageToHotel.length > 250) {
    throw new Error('Message to hotel must be 250 characters or less');
  }

  const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
  const bookingReference = generateBookingReference();
  const createdAt = new Date();
  const status = 'pending';

  try {
    // Insert booking data using new schema
    await pool.query(
      `INSERT INTO ${tableName} (
        id, bookingReference, userId, destinationId, hotelId, hotelName, hotelAddress, imageUrl, 
        checkInDate, checkOutDate, numberOfNights, numberOfRooms, adults, children, 
        roomTypes, messageToHotel, pricePerNight, totalAmount, whatsIncluded, selectedRoom,
        status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        bookingReference,
        bookingData.userId,
        bookingData.destinationId,
        bookingData.hotelId,
        bookingData.hotelName,
        bookingData.hotelAddress,
        bookingData.imageUrl,
        bookingData.checkInDate,
        bookingData.checkOutDate,
        bookingData.numberOfNights,
        bookingData.numberOfRooms,
        bookingData.adults,
        bookingData.children,
        JSON.stringify(bookingData.roomTypes),
        bookingData.messageToHotel,
        bookingData.pricePerNight,
        bookingData.totalAmount,
        JSON.stringify(bookingData.whatsIncluded),
        bookingData.selectedRoom ? JSON.stringify(bookingData.selectedRoom) : null,
        status,
        createdAt,
      ]
    );

    // Insert guest information
    await pool.query(
      `INSERT INTO ${guestInfoTableName} (
        bookingId, firstName, lastName, phoneNumber, emailAddress, specialRequests, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        guest.firstName,
        guest.lastName,
        guest.phoneNumber,
        guest.emailAddress,
        guest.specialRequests,
        createdAt,
      ]
    );

    return bookingId;
  } catch (error) {
    console.error('Database error creating booking:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      sqlMessage: (error as any).sqlMessage,
      sqlState: (error as any).sqlState,
      errno: (error as any).errno,
      sql: (error as any).sql
    });
    throw new Error(`Failed to create booking in database: ${error instanceof Error ? error.message : 'Unknown database error'}`);
  }
}

async function getBookingById(bookingId: string): Promise<BookingData | null> {
  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  try {
    // Get booking data
    const [bookingRows]: any = await pool.query(
      `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
      [bookingId]
    );
    
    if (bookingRows.length === 0) {
      return null;
    }

    const bookingRow = bookingRows[0];

    // Parse JSON fields with proper null handling
    try {
      bookingRow.whatsIncluded = bookingRow.whatsIncluded ? JSON.parse(bookingRow.whatsIncluded) : [];
      bookingRow.roomTypes = bookingRow.roomTypes ? JSON.parse(bookingRow.roomTypes) : ['Standard'];
      bookingRow.selectedRoom = bookingRow.selectedRoom ? JSON.parse(bookingRow.selectedRoom) : undefined;
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      bookingRow.whatsIncluded = [];
      bookingRow.roomTypes = ['Standard'];
      bookingRow.selectedRoom = undefined;
    }

    // Get guest information
    const [guestRows]: any = await pool.query(
      `SELECT * FROM ${guestInfoTableName} WHERE bookingId = ? LIMIT 1`,
      [bookingId]
    );

    let guestInformation: GuestInformation;
    
    if (guestRows.length > 0) {
      // New format with separate guest table
      const guestRow = guestRows[0];
      guestInformation = {
        firstName: guestRow.firstName || 'Guest',
        lastName: guestRow.lastName || 'User',
        phoneNumber: guestRow.phoneNumber || '',
        emailAddress: guestRow.emailAddress || '',
        specialRequests: guestRow.specialRequests || undefined
      };
    } else {
      // Fallback for missing guest data
      guestInformation = {
        firstName: 'Guest',
        lastName: 'User',
        phoneNumber: '',
        emailAddress: '',
        specialRequests: undefined
      };
    }

    // Create payment information with null safety
    const paymentInformation = {
      paymentIntentId: bookingRow.paymentIntentId || undefined,
      payeeId: bookingRow.payeeId || undefined,
      maskedCardNumber: bookingRow.maskedCardNumber || undefined,
      cardExpiryDate: bookingRow.cardExpiryDate || undefined
    };

    // Construct the new format BookingData with null safety
    const bookingData: BookingData = {
      id: bookingRow.id,
      bookingReference: bookingRow.bookingReference || bookingRow.id,
      userId: bookingRow.userId,
      destinationId: bookingRow.destinationId || undefined,
      hotelId: bookingRow.hotelId,
      hotelName: bookingRow.hotelName,
      hotelAddress: bookingRow.hotelAddress || '',
      imageUrl: bookingRow.imageUrl,
      checkInDate: bookingRow.checkInDate,
      checkOutDate: bookingRow.checkOutDate,
      numberOfNights: bookingRow.numberOfNights || 0,
      numberOfRooms: bookingRow.numberOfRooms || 1,
      adults: bookingRow.adults || 1,
      children: bookingRow.children || 0,
      roomTypes: bookingRow.roomTypes || ['Standard'],
      selectedRoom: bookingRow.selectedRoom || undefined,
      pricePerNight: bookingRow.pricePerNight || 0,
      totalAmount: bookingRow.totalAmount || 0,
      whatsIncluded: bookingRow.whatsIncluded || [],
      guestInformation: guestInformation,
      paymentInformation: paymentInformation,
      status: bookingRow.status || 'pending',
      createdAt: bookingRow.createdAt,
      updatedAt: bookingRow.updatedAt || undefined
    };

    return bookingData;
  } catch (error) {
    console.error('Database error fetching booking:', error);
    throw new Error('Failed to fetch booking from database');
  }
}

async function updateBooking(
  bookingId: string,
  paymentIntentId: string,
  status: 'confirmed' | 'cancelled'
) {
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
    const [existingRows]: any = await pool.query(
      `SELECT id FROM ${tableName} WHERE id = ? LIMIT 1`,
      [bookingId]
    );

    if (existingRows.length === 0) {
      throw new Error('Booking not found or no changes made');
    }

    // Now perform the update
    const result: any = await pool.query(
      `UPDATE ${tableName} SET paymentIntentId = ?, status = ?, updatedAt = ? WHERE id = ?`,
      [paymentIntentId, status, new Date(), bookingId]
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
