import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import styles from './HotelDetailPage.module.css';
import Test from '../components/hotel_detail/Test';

// ===== TESTING CONFIGURATION =====
const MOCK_MODE = true; // Set to false when ready to test real API
const MOCK_DELAY = 800; // Simulate network latency in ms

// Simplified type definitions for testing
type Hotel = {
  id: string;
  name: string;
  rating: number;
  address1: string;
  description: string;
  amenities: Record<string, boolean>;
  image: string;
};

type Price = {
  id: string;
  room_type: string;
  price: number;
  free_cancellation: boolean;
  image: string;
};

type ApiResponse = {
  hotel: Hotel;
  prices: Price[];
};

const HotelDetailPageTest = (): ReactNode => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        
        if (MOCK_MODE) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

          // Mock data based on hotelId
          const mockHotel: Hotel = {
            id: hotelId || 'mock-hotel',
            name: `Mock Hotel ${hotelId?.toUpperCase() || 'X'}`,
            rating: Math.min(5, Math.max(3, Math.random() * 5)), // Random rating 3-5
            address1: `${Math.floor(Math.random() * 100) + 1} Mock Street, Singapore`,
            description: `This is a mock hotel description for testing purposes. Hotel ID: ${hotelId}`,
            amenities: {
              airConditioning: true,
              wifi: true,
              pool: Math.random() > 0.3,
              gym: Math.random() > 0.5,
              breakfast: Math.random() > 0.7
            },
            image: `https://source.unsplash.com/random/800x600/?hotel,${hotelId}`
          };

          const mockPrices: Price[] = [
            {
              id: 'room-1',
              room_type: 'Standard Room',
              price: Math.floor(Math.random() * 200) + 50, // $50-$250
              free_cancellation: Math.random() > 0.5,
              image: 'https://source.unsplash.com/random/400x300/?hotel-room'
            },
            {
              id: 'room-2',
              room_type: 'Deluxe Room',
              price: Math.floor(Math.random() * 300) + 100, // $100-$400
              free_cancellation: Math.random() > 0.3,
              image: 'https://source.unsplash.com/random/400x300/?luxury-room'
            }
          ];

          setData({
            hotel: mockHotel,
            prices: mockPrices
          });
          return;
        }

        /* REAL API IMPLEMENTATION (COMMENTED OUT)
        const response = await fetch(`/api/hotels/${hotelId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
        */
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelId]);

  if (loading) return <div className={styles.loading}>Loading mock data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!data) return <div className={styles.error}>No data available</div>;

  return (
    <div className={styles.container}>
      <h1>{data.hotel.name}</h1>
      <img 
        src={data.hotel.image} 
        alt={data.hotel.name} 
        className={styles.hotelImage}
      />
      
      <div className={styles.rating}>
        Rating: {'⭐'.repeat(Math.round(data.hotel.rating))}
      </div>
      
      <p>{data.hotel.description}</p>
      <address>{data.hotel.address1}</address>
      <h2>Amenities</h2>
      <ul className={styles.amenities}>
        {Object.entries(data.hotel.amenities)
          .filter(([_, available]) => available)
          .map(([amenity]) => (
            <li key={amenity}>{amenity}</li>
          ))}
      </ul>
      
      <h2>Available Rooms</h2>
      <div className={styles.roomList}>
        {data.prices.map(room => (
          <div key={room.id} className={styles.roomCard}>
            <img src={room.image} alt={room.room_type} />
            <h3>{room.room_type}</h3>
            <p>${room.price}/night</p>
            {room.free_cancellation && <span>Free Cancellation</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelDetailPageTest;