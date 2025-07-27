//Not really needed right now 
import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './HotelDetailPage.module.css';
import { hotelApiService, HotelDetails, RoomPrice } from '../services/hotelApi';
import { useUrlParams, buildGuestsString } from '../hooks/hotel_details/useUrlParams.ts';

// Transformed data types for UI
type Hotel = {
  id: string;
  name: string;
  rating: number;
  address: string;
  description: string;
  amenities: Record<string, boolean>;
  images: string[];
  latitude?: number;
  longitude?: number;
};

type Room = {
  id: string;
  room_type: string;
  price: number;
  free_cancellation: boolean;
  image: string;
  description: string;
  long_description: string;
  amenities: string[];
  key: string;
};

type ApiResponse = {
  hotel: Hotel;
  rooms: Room[];
  searchParams: {
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    rooms: number;
  };
};

const HotelDetailPage = (): ReactNode => {
  const urlParams = useUrlParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Transform API data to UI format
  const transformHotelData = (apiHotel: HotelDetails): Hotel => ({
    id: apiHotel.id,
    name: apiHotel.name,
    rating: apiHotel.rating,
    address: apiHotel.address,
    description: apiHotel.description,
    amenities: apiHotel.amenities,
    images: hotelApiService.generateMultipleImageUrls(apiHotel.image_details, 5),
    latitude: apiHotel.latitude,
    longitude: apiHotel.longitude
  });

  const transformRoomData = (apiRooms: RoomPrice[]): Room[] => {
    return apiRooms.map((room, index) => ({
      id: room.key,
      room_type: room.room_normalized_description,
      price: Math.round(room.price),
      free_cancellation: room.free_cancellation,
      image: room.images[0] || `https://images.unsplash.com/photo-${['1649972904349-6e44c42644a7', '1581091226825-a6a2a5aee158', '1721322800607-8c38375eef04'][index % 3]}?w=600&h=400&fit=crop`,
      description: room.description,
      long_description: room.long_description,
      amenities: room.amenities,
      key: room.key
    }));
  };

  useEffect(() => {
    const fetchHotelData = async () => {
      if (!urlParams) return;

      try {
        setLoading(true);
        setError(null);

        // Build guests string for API
        const guestsString = buildGuestsString(urlParams.adults, urlParams.children, urlParams.rooms);

        // Fetch hotel details and prices in parallel
        const [hotelDetails, hotelPrices] = await Promise.all([
          hotelApiService.getHotelDetails(urlParams.hotelId),
          hotelApiService.getHotelPrices(urlParams.hotelId, {
            destinationId: urlParams.destinationId,
            checkin: urlParams.checkin,
            checkout: urlParams.checkout,
            guests: guestsString,
            lang: urlParams.lang,
            currency: urlParams.currency,
            countryCode: urlParams.countryCode
          })
        ]);

        const transformedData: ApiResponse = {
          hotel: transformHotelData(hotelDetails),
          rooms: transformRoomData(hotelPrices.rooms),
          searchParams: {
            checkin: urlParams.checkin,
            checkout: urlParams.checkout,
            adults: urlParams.adults,
            children: urlParams.children,
            rooms: urlParams.rooms
          }
        };

        setData(transformedData);
      } catch (err) {
        console.error('Error fetching hotel data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hotel data');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [urlParams]);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    // You can add booking logic here
    console.log('Selected room:', room);
  };

  const handleReserve = () => {
    if (!data) return;
    
    const reservationData = {
      hotel: data.hotel,
      room: selectedRoom || data.rooms[0],
      searchParams: data.searchParams,
      urlParams
    };
    
    console.log('Making reservation:', reservationData);
    // Implement reservation logic here
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

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
          </div>
          <p className={styles.address}>{data.hotel.address}</p>
          
          {/* Search Summary */}
          <div className={styles.searchSummary}>
            <span>{formatDate(data.searchParams.checkin)} - {formatDate(data.searchParams.checkout)}</span>
            <span>•</span>
            <span>{data.searchParams.adults} adult{data.searchParams.adults > 1 ? 's' : ''}</span>
            {data.searchParams.children > 0 && (
              <>
                <span>•</span>
                <span>{data.searchParams.children} child{data.searchParams.children > 1 ? 'ren' : ''}</span>
              </>
            )}
            <span>•</span>
            <span>{data.searchParams.rooms} room{data.searchParams.rooms > 1 ? 's' : ''}</span>
          </div>
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
                    <input 
                      type="date" 
                      className={styles.dateInput} 
                      value={data.searchParams.checkin}
                      readOnly
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Check-out</label>
                    <input 
                      type="date" 
                      className={styles.dateInput} 
                      value={data.searchParams.checkout}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Guests & Rooms</label>
                  <div className={styles.guestInfo}>
                    <span>{data.searchParams.adults + data.searchParams.children} guests</span>
                    <span>•</span>
                    <span>{data.searchParams.rooms} room{data.searchParams.rooms > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <button 
                  className={styles.bookButton}
                  onClick={handleReserve}
                >
                  Reserve {selectedRoom ? selectedRoom.room_type : 'Room'}
                </button>
                
                <p className={styles.freeCancel}>
                  {selectedRoom?.free_cancellation ? 'Free cancellation available' : 'Check cancellation policy'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Options */}
        <div className={styles.roomOptions}>
          <h2>Choose your room</h2>
          <div className={styles.roomGrid}>
            {data.rooms.map(room => (
              <div 
                key={room.id} 
                className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selectedRoom : ''}`}
              >
                <img 
                  src={room.image} 
                  alt={room.room_type}
                  className={styles.roomImage}
                />
                <div className={styles.roomDetails}>
                  <h3 className={styles.roomType}>{room.room_type}</h3>
                  <p className={styles.roomDescription}>{room.description}</p>
                  
                  {room.amenities.length > 0 && (
                    <div className={styles.roomAmenities}>
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className={styles.amenityTag}>
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className={styles.moreAmenities}>
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className={styles.roomPrice}>
                    <span className={styles.roomPriceAmount}>${room.price}</span>
                    <span className={styles.roomPriceNight}>per night</span>
                  </div>
                  
                  {room.free_cancellation && (
                    <span className={styles.freeCancel}>Free cancellation</span>
                  )}
                  
                  <button 
                    className={`${styles.selectRoomButton} ${selectedRoom?.id === room.id ? styles.selectedButton : ''}`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    {selectedRoom?.id === room.id ? 'Selected' : 'Select Room'}
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

