import { pool } from '../database/db'; 

const tableName = 'bookings';

//Filter by userId
async function getBookingHistory(userId?: string) {
  try {
    let query = `SELECT id, userId, hotelName, checkInDate, checkOutDate, status, imageUrl, createdAt FROM ${tableName}`;
    let params: any[] = [];
    
    if (userId) {
      query += ` WHERE userId = ?`;
      params.push(userId);
    }
    
    query += ` ORDER BY createdAt DESC`;
    
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return [];
  }
}

export { getBookingHistory };