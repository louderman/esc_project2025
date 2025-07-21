import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Hotel, Emenities } from '../../../types/Hotel';
import type { PriceResponse, Price } from '../../../types/Price';
import styles from './HotelDetailPage.module.css';

const MOCK_MODE = true;

type HotelParams = {
  hotelId: string;
};

type ApiResponse = {
  hotel: Hotel;
  prices: PriceResponse;
};

const HotelDetailPage = (): ReactNode => {
  const { hotelId } = useParams<HotelParams>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!hotelId?.trim()) {
          throw new Error('Hotel ID is required');
        }

        if (MOCK_MODE) {
          // Simulate a short delay
          await new Promise(res => setTimeout(res, 300));

          const mockData: ApiResponse = {
  hotel: {
    id: hotelId,
    name: 'Mock Grand Hotel',
    rating: 4.3,
    address1: '123 Mock Street',
    address: 'Mock City',
    description: 'Welcome to Mock Grand Hotel, your premium choice for testing.',
    amenities: {
      airConditioning: true,
      dataPorts: false,
      parkingGarage: true,
      safe: false,
      businessCenter: true,
      childrenAllowed: true,
      clothingIron: true,
      dryCleaning: false,
      hairDryer: true,
      inHouseBar: true,
      inHouseDining: true,
      meetingRooms: true,
      miniBarInRoom: true,
      outdoorPool: false,
      roomService: true,
      sauna: false,
      tVInRoom: true,
      voiceMail: false,
      continentalBreakfast: true,
      kitchen: false
    },
    trustyou: {
      id: 'mock-trustyou-id',
      score: {
        overall: 8.8,
        kaligo_overall: 8.5,
        solo: null,
        couple: 9,
        family: 8,
        business: 7
      }
    },
    distance: 0.5, // Added missing property
    amenities_ratings: [ // Added missing property
      {
        name: 'Cleanliness',
        score: 9.2
      },
      {
        name: 'Comfort',
        score: 8.7
      }
    ],
    imageCount: 5,
    latitude: 1.3521,
    longitude: 103.8198,
    categories: {
      overall: {
        name: 'Overall',
        score: 8.5,
        popularity: 90
      },
      city_hotel: {
        name: 'City Hotel',
        score: 8.2,
        popularity: 85
      },
      romantic_hotel: {
        name: 'Romantic',
        score: 7.8,
        popularity: 75
      },
      family_hotel: {
        name: 'Family Friendly',
        score: 9.0,
        popularity: 92
      },
      business_hotel: {
        name: 'Business',
        score: 8.7,
        popularity: 88
      }
    },
    original_metadata: {
      name: 'Mock Grand Hotel',
      city: 'Mock City',
      state: null,
      country: null
    },
    imgix_url: 'https://via.placeholder.com/',
    hires_image_index: '800x300?text=Mock+Hotel',
    number_of_images: 5,
    default_image_index: 0,
    cloudflare_image_url: '',
    image_details: {
      suffix: '.jpg',
      count: 5,
      prefix: 'hotel_'
    },
    checkin_time: '14:00'
  },
  prices: {
    searchCompleted: true,
    completed: true,
    status: 'success',
    currency: 'SGD',
    hotels: [
      {
        id: 'room1',
        searchRank: 1,
        price_type: 'Standard Rate',
        free_cancellation: true,
        rooms_available: 3,
        max_cash_payment: 220,
        converted_max_cash_payment: 220,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 220,
        price: 220,
        converted_price: 220,
        lowest_converted_price: 220,
        market_rates: [],
        room_type: 'Deluxe King Room',
        image: ''
      },
      {
        id: 'room2',
        searchRank: 2,
        price_type: 'Non-Refundable',
        free_cancellation: false,
        rooms_available: 5,
        max_cash_payment: 180,
        converted_max_cash_payment: 180,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 180,
        price: 180,
        converted_price: 180,
        lowest_converted_price: 180,
        market_rates: [],
        room_type: 'Standard Twin Room',
        image: ''
      }
    ]
  }
};

          setData(mockData);
          return;
        }

        // Real API fetch
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`/api/hotel/combined/${hotelId}`, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-Source': 'hotel-detail-page'
          }
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorText.slice(0, 100)}`);
        }

        const result = await response.json() as ApiResponse;
        setData(result);
      } catch (err) {
        if (signal.aborted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load hotel data';
        setError(errorMessage);
        if (errorMessage.includes('401')) navigate('/login');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchHotelData();
    return () => abortController.abort();
  }, [hotelId, navigate]);

  // Helper function to get amenity display names
  const getAmenityDisplayName = (amenityKey: keyof Emenities): string => {
    const names: Record<keyof Emenities, string> = {
      airConditioning: 'Air Conditioning',
      dataPorts: 'Data Ports',
      parkingGarage: 'Parking Garage',
      safe: 'Safe',
      businessCenter: 'Business Center',
      childrenAllowed: 'Children Allowed',
      clothingIron: 'Clothing Iron',
      dryCleaning: 'Dry Cleaning',
      hairDryer: 'Hair Dryer',
      inHouseBar: 'In-House Bar',
      inHouseDining: 'In-House Dining',
      meetingRooms: 'Meeting Rooms',
      miniBarInRoom: 'Mini Bar',
      outdoorPool: 'Outdoor Pool',
      roomService: 'Room Service',
      sauna: 'Sauna',
      tVInRoom: 'TV in Room',
      voiceMail: 'Voice Mail',
      continentalBreakfast: 'Continental Breakfast',
      kitchen: 'Kitchen'
    };
    return names[amenityKey] || amenityKey;
  };

  // Get image URL
  const getImageUrl = (): string => {
    if (!data?.hotel) return 'https://via.placeholder.com/800x300?text=Hotel+Image';
    const { imgix_url, hires_image_index } = data.hotel;
    if (imgix_url && hires_image_index) {
      return `${imgix_url}${hires_image_index}`;
    }
    return 'https://via.placeholder.com/800x300?text=Hotel+Image';
  };

  // Format price
  const formatPrice = (price: number): string => {
    const currency = data?.prices?.currency || 'SGD';
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get the lowest price
  const getLowestPrice = (): number => {
    if (!data?.prices?.hotels?.length) return 0;
    return Math.min(...data.prices.hotels.map(room => room.price || 0));
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorState}>
        <h2>Error loading hotel details</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className={styles.errorState}>
        <h2>No hotel data available</h2>
        <p>Unable to load hotel information.</p>
      </div>
    );
  }

  const { hotel, prices } = data;

  // Get active amenities
  const activeAmenities = hotel.amenities ? 
    (Object.keys(hotel.amenities) as Array<keyof Emenities>).filter(key => hotel.amenities[key] === true) : 
    [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <div className={styles.searchItem}>
            <span className={styles.icon}>📍</span>
            <input 
              type="text" 
              placeholder="Enter Destination" 
              value={hotel.original_metadata?.city || hotel.address1 || 'Singapore'} 
              readOnly 
            />
          </div>
          <div className={styles.searchItem}>
            <span className={styles.icon}>📅</span>
            <input type="text" placeholder="Check-in Date" value="Select Date" readOnly />
          </div>
          <div className={styles.searchItem}>
            <span className={styles.icon}>📅</span>
            <input type="text" placeholder="Check-out Date" value="Select Date" readOnly />
          </div>
          <div className={styles.searchItem}>
            <span className={styles.icon}>👥</span>
            <input type="text" placeholder="Guests" value="2 Adults, 1 Room" readOnly />
          </div>
        </div>
      </div>

      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>
          <div className={styles.imageContainer}>
            <img 
              src={getImageUrl()} 
              alt={hotel.name || 'Hotel'} 
              className={styles.roomImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x300?text=Hotel+Image';
              }}
            />
            <div className={styles.roomBadge}>
              <div className={styles.hotelName}>{hotel.name || 'Hotel'}</div>
              <div className={styles.hotelRating}>
                {'⭐'.repeat(Math.max(0, Math.min(5, Math.round(hotel.rating || 0))))}
              </div>
            </div>
          </div>

          <div className={styles.contentSection}>
            <section className={styles.hotelOverview}>
              <h2 className={styles.sectionTitle}>Hotel Overview</h2>
              <div className={styles.sectionContent}>
                <div className={styles.description}>
                  {hotel.description || 'Welcome to our hotel. Experience comfort and luxury in our well-appointed rooms and suites.'}
                </div>
                {hotel.address1 && (
                  <div className={styles.address}>
                    <strong>Address:</strong> {hotel.address1}
                    {hotel.address && `, ${hotel.address}`}
                  </div>
                )}
              </div>
            </section>

            {hotel.trustyou && Object.keys(hotel.trustyou.score).length > 0 && (
              <section className={styles.ratingsSection}>
                <h2 className={styles.sectionTitle}>Guest Ratings</h2>
                <div className={styles.scoresGrid}>
                  {Object.entries(hotel.trustyou.score)
                    .filter(([_, score]) => score !== null && score !== undefined)
                    .map(([category, score]) => (
                      <div key={category} className={styles.scoreItem}>
                        <span className={styles.scoreLabel}>
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={styles.scoreValue}>{score}/10</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {activeAmenities.length > 0 && (
              <section className={styles.amenitiesSection}>
                <h2 className={styles.sectionTitle}>Amenities</h2>
                <div className={styles.amenitiesGrid}>
                  {activeAmenities.map((amenityKey) => (
                    <div key={amenityKey} className={styles.amenityItem}>
                      <div className={styles.amenityIcon}>✓</div>
                      <span className={styles.amenityText}>{getAmenityDisplayName(amenityKey)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {prices?.hotels && prices.hotels.length > 0 && (
              <section className={styles.roomOptionsSection}>
                <h2 className={styles.sectionTitle}>Available Rooms</h2>
                <div className={styles.roomOptions}>
                  {prices.hotels.map((room: Price, index: number) => (
                    <div key={room.id || index} className={styles.roomOption}>
                      <div className={styles.roomImageContainer}>
                        <img 
                          src={room.image || 'https://via.placeholder.com/80x60?text=Room'} 
                          alt={room.room_type || 'Room'} 
                          className={styles.roomOptionImage}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/80x60?text=Room';
                          }}
                        />
                      </div>
                      <div className={styles.roomInfo}>
                        <div className={styles.roomName}>
                          {room.room_type || 'Standard Room'}
                        </div>
                        <div className={styles.roomDetails}>
                          <div className={styles.priceType}>{room.price_type}</div>
                          <div className={styles.roomMeta}>
                            1 room • 1 night
                            {room.rooms_available && room.rooms_available > 0 && (
                              <span className={styles.availability}>
                                • {room.rooms_available} rooms available
                              </span>
                            )}
                          </div>
                          {room.free_cancellation && (
                            <div className={styles.cancellationBadge}>
                              Free Cancellation
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.roomPricing}>
                        <div className={styles.roomPrice}>
                          {formatPrice(room.price || 0)}
                        </div>
                        <div className={styles.priceNote}>per night</div>
                      </div>
                      <button 
                        className={styles.selectBtn}
                        onClick={() => {
                          // Handle room selection
                          console.log('Selected room:', room);
                        }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className={styles.locationSection}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <div className={styles.mapContainer}>
                <div className={styles.mapPlaceholder}>
                  <div className={styles.locationPin}></div>
                  <p>Interactive map coming soon</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className={styles.facilitiesSidebar}>
          <div className={styles.priceSection}>
            <div className={styles.price}>
              {formatPrice(getLowestPrice())}
            </div>
            <div className={styles.priceLabel}>
              Starting from • per night
            </div>
          </div>

          <div className={styles.rating}>
            <span className={styles.stars}>
              {'⭐'.repeat(Math.max(0, Math.min(5, Math.round(hotel.rating || 0))))}
            </span>
            <span className={styles.ratingText}>
              {hotel.rating?.toFixed(1) || 'N/A'} 
              {(hotel as any).review_count && ` (${(hotel as any).review_count} reviews)`}
            </span>
          </div>

          {hotel.categories && Object.keys(hotel.categories).length > 0 && (
            <div className={styles.categoriesSection}>
              <h3 className={styles.sectionTitle}>Categories</h3>
              <ul className={styles.facilityList}>
                {Object.entries(hotel.categories)
                  .filter(([_, category]) => category?.name && category?.score !== null)
                  .map(([categoryKey, category]) => (
                    <li key={categoryKey} className={styles.facilityItem}>
                      <span className={styles.facilityName}>{category?.name}</span>
                      <span className={styles.facilityScore}>{category?.score}/10</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {prices?.currency && (
            <div className={styles.currencyInfo}>
              <small>All prices shown in {prices.currency}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;