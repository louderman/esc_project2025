
import { pool } from '../database/db'; 

const tableName = 'bookings';

//Filter by userId
async function getBookingHistory(userId?: string) {
  try {
    if (!userId) {
      console.log('No userId provided to getBookingHistory');
      return [];
    }

    let query = `SELECT id, userId, hotelName, checkInDate, checkOutDate, status, imageUrl, createdAt, hotelAddress, numberOfNights, numberOfRooms, adults, children, totalAmount FROM ${tableName}`;
    let params: any[] = [];
    
    query += ` WHERE userId = ?`;
    params.push(userId);
    query += ` ORDER BY createdAt DESC`;
    
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching booking history:', error);
    throw new Error('Failed to fetch bookings');
  }
}
export { getBookingHistory };