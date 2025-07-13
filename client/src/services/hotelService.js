// client/src/services/hotelService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1'; // Update if your server runs on different port

export const getCombinedHotelData = async (uid) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/hotels/combined/${uid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    throw error; // Re-throw for component to handle
  }
};