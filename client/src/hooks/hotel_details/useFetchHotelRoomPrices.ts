import { useState, useEffect } from 'react';
import { hotelApiService, type RoomPrice } from '@/services/hotelAPI';

interface UseFetchHotelRoomPricesParams {
  hotelId: string;
  destinationId: string;
  checkin: string;
  checkout: string;
  guests: string;
  enabled?: boolean;
}

export function useFetchHotelRoomPrices({
  hotelId,
  destinationId,
  checkin,
  checkout,
  guests,
  enabled = true
}: UseFetchHotelRoomPricesParams) {
  const [rooms, setRooms] = useState<RoomPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Early return if hook is disabled or missing required parameters
    if (!enabled) {
      console.log('useFetchHotelRoomPrices: Hook disabled, skipping API call');
      setLoading(false);
      setError(null);
      setRooms([]);
      return;
    }
    
    if (!hotelId || !destinationId || !checkin || !checkout || !guests) {
      console.log('useFetchHotelRoomPrices: Missing required parameters, skipping API call');
      return;
    }

    const fetchRoomPrices = async (attempt: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching room prices for hotel: ${hotelId}, attempt ${attempt}/${maxRetries}`);
        
        // Use the hotel detail pricing endpoint that matches the server route
        const url = `/api/hotel-detail/hotel/${hotelId}/prices?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch room prices: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Destination pricing response:', data);
        
        // Check if the search is still in progress
        if (!data.completed && data.status !== 'no_rooms') {
          console.log('Price search still in progress, will retry...');
          if (attempt < maxRetries) {
            setTimeout(() => fetchRoomPrices(attempt + 1), 2000); // Retry after 2 seconds
            return;
          } else {
            throw new Error('Price search timed out after maximum retries');
          }
        }
        
        // Debug: Log available hotel IDs in pricing data
        if (data.hotels && data.hotels.length > 0) {
          console.log('Available hotel IDs in pricing data:', data.hotels.map((h: any) => h.id));
          console.log('Total hotels in pricing data:', data.hotels.length);
        }
        
        // The server now returns only the specific hotel, so we can directly access it
        const hotelWithRooms = data.hotels?.[0];
        
        if (hotelWithRooms && hotelWithRooms.rooms && Array.isArray(hotelWithRooms.rooms)) {
          console.log('Found hotel with rooms:', hotelWithRooms.rooms.length, 'rooms');
          console.log('Hotel rooms data:', hotelWithRooms.rooms);
          
          // Transform the room data to match our RoomPrice interface
          const transformedRooms = hotelWithRooms.rooms.map((room: any) => ({
            key: room.key,
            room_normalized_description: room.roomDescription || room.room_normalized_description,
            free_cancellation: room.free_cancellation,
            description: room.description,
            long_description: room.long_description,
            images: room.images || [],
            amenities: room.amenities || [],
            price: room.price,
            market_rates: room.market_rates || []
          }));
          
          console.log('Transformed rooms:', transformedRooms);
          setRooms(transformedRooms);
          setRetryCount(0); // Reset retry count on success
        } else {
          console.log('Hotel not found in pricing or no rooms available');
          console.log('Looking for hotel ID:', hotelId);
          console.log('Available hotel IDs in pricing:', data.hotels?.map((h: any) => h.id) || []);
          
          // Handle case where no rooms are available
          if (data.status === 'no_rooms' && data.message) {
            console.log('No rooms available:', data.message);
            setRooms([]);
            setError(new Error(data.message));
          } else {
            setRooms([]);
          }
        }
      } catch (err) {
        console.error(`Error fetching room prices (attempt ${attempt}):`, err);
        
        // Retry logic for transient errors
        if (attempt < maxRetries && err instanceof Error && 
            (err.message.includes('temporarily unavailable') || 
             err.message.includes('Failed to fetch'))) {
          console.log(`Retrying in 2 seconds... (${attempt}/${maxRetries})`);
          setTimeout(() => fetchRoomPrices(attempt + 1), 2000);
          return;
        }
        
        setError(err instanceof Error ? err : new Error('Failed to fetch room prices'));
        setRetryCount(attempt);
      } finally {
        if (attempt >= maxRetries || !error) {
          setLoading(false);
        }
      }
    };

    fetchRoomPrices();
  }, [hotelId, destinationId, checkin, checkout, guests, enabled]);

  return { rooms, loading, error, retryCount };
} 