import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import styles from './HotelDetailPage.module.css';

// ===== TESTING CONFIGURATION =====
const MOCK_MODE = true; // Set to false when ready to test real API
const MOCK_DELAY = 800; // Simulate network latency in ms

// Simplified type definitions for testing
type Hotel = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address1: string;
  description: string;
  amenities: Record<string, boolean>;
  images: string[];
};

type Room = {
  id: string;
  room_type: string;
  price: number;
  free_cancellation: boolean;
  image: string;
  occupancy: number;
  bed_type: string;
  size: string;
};

type ApiResponse = {
  hotel: Hotel;
  rooms: Room[];
};

const HotelDetailPage = (): ReactNode => {
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

          // Enhanced mock data
          const mockHotel: Hotel = {
            id: hotelId || 'park-royal-singapore',
            name: 'Park Royal Collection Marina Bay',
            rating: 4.5,
            reviewCount: 2847,
            address1: '6 Raffles Boulevard, Marina Bay, Singapore 039594',
            description: 'Park Royal Collection Marina Bay offers luxury accommodation in the heart of Singapore\'s business district. Located within walking distance of Marina Bay Sands, Gardens by the Bay, and the Singapore Flyer, this contemporary hotel features elegantly appointed rooms with stunning city and bay views.',
            amenities: {
              wifi: true,
              airConditioning: true,
              pool: true,
              gym: true,
              breakfast: true,
              parking: true,
              restaurant: true
            },
            images: [
              'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
              'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
              'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
            ]
          };

          const mockRooms: Room[] = [
            {
              id: 'deluxe-room',
              room_type: 'Deluxe Room',
              price: 331,
              free_cancellation: true,
              image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop',
              occupancy: 2,
              bed_type: 'King bed',
              size: '35'
            },
            {
              id: 'premier-room',
              room_type: 'Premier Room',
              price: 405,
              free_cancellation: true,
              image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
              occupancy: 2,
              bed_type: 'King bed',
              size: '42'
            },
            {
              id: 'suite',
              room_type: 'Executive Suite',
              price: 650,
              free_cancellation: false,
              image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=400&fit=crop',
              occupancy: 4,
              bed_type: 'King bed + Sofa bed',
              size: '65'
            }
          ];

          setData({
            hotel: mockHotel,
            rooms: mockRooms
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading hotel details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No hotel data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Hotels.com</h1>
          <div className={styles.headerActions}>
            <span>Help</span>
            <span>English</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Hotel Title & Rating */}
        <div className={styles.hotelHeader}>
          <h1 className={styles.hotelName}>{data.hotel.name}</h1>
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={i < Math.floor(data.hotel.rating) ? styles.starFilled : styles.starEmpty}
                >
                  ⭐
                </span>
              ))}
              <span className={styles.ratingScore}>{data.hotel.rating}</span>
            </div>
            <span className={styles.reviewCount}>({data.hotel.reviewCount} reviews)</span>
          </div>
          <p className={styles.address}>{data.hotel.address1}</p>
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Left Column - Images and Info */}
          <div className={styles.leftColumn}>
            {/* Image Gallery */}
            <div className={styles.imageGallery}>
              <div className={styles.mainImage}>
                <img 
                  src={data.hotel.images[0]} 
                  alt={data.hotel.name}
                  className={styles.heroImage}
                />
              </div>
              <div className={styles.thumbnails}>
                {data.hotel.images.slice(1).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${data.hotel.name} view ${index + 2}`}
                    className={styles.thumbnail}
                  />
                ))}
              </div>
            </div>

            {/* Hotel Info */}
            <div className={styles.hotelInfo}>
              <h2>About this hotel</h2>
              <p className={styles.description}>{data.hotel.description}</p>
              
              <h3>Amenities</h3>
              <div className={styles.amenities}>
                {Object.entries(data.hotel.amenities)
                  .filter(([_, available]) => available)
                  .map(([amenity]) => (
                    <span key={amenity} className={styles.amenity}>
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className={styles.rightColumn}>
            <div className={styles.bookingCard}>
              <div className={styles.priceHeader}>
                <span className={styles.price}>${data.rooms[0]?.price || 331}</span>
                <span className={styles.perNight}>per night</span>
              </div>
              
              <div className={styles.bookingForm}>
                <div className={styles.dateInputs}>
                  <div className={styles.inputGroup}>
                    <label>Check-in</label>
                    <input type="date" className={styles.dateInput} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Check-out</label>
                    <input type="date" className={styles.dateInput} />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Guests</label>
                  <select className={styles.guestSelect}>
                    <option>2 guests</option>
                    <option>1 guest</option>
                    <option>3 guests</option>
                    <option>4 guests</option>
                  </select>
                </div>
                
                <button className={styles.bookButton}>
                  Reserve
                </button>
                
                <p className={styles.freeCancel}>Free cancellation for 48 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Options */}
        <div className={styles.roomOptions}>
          <h2>Choose your room</h2>
          <div className={styles.roomGrid}>
            {data.rooms.map(room => (
              <div key={room.id} className={styles.roomCard}>
                <img 
                  src={room.image} 
                  alt={room.room_type}
                  className={styles.roomImage}
                />
                <div className={styles.roomDetails}>
                  <h3 className={styles.roomType}>{room.room_type}</h3>
                  <div className={styles.roomSpecs}>
                    <span>👥 {room.occupancy} guests</span>
                    <span>🛏️ {room.bed_type}</span>
                    <span>📐 {room.size} m²</span>
                  </div>
                  <div className={styles.roomPrice}>
                    <span className={styles.roomPriceAmount}>${room.price}</span>
                    <span className={styles.roomPriceNight}>per night</span>
                  </div>
                  {room.free_cancellation && (
                    <span className={styles.freeCancel}>Free cancellation</span>
                  )}
                  <button className={styles.selectRoomButton}>
                    Select Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetailPage;