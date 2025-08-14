import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BookingCard from '../components/hotel/BookingCard';
import HotelHeader from '../components/hotel/HotelHeader';
import HotelImageGallery from '../components/hotel/HotelImageGallery';
import HotelInfo from '../components/hotel/HotelInfo';
import LocationMap from '../components/hotel/LocationMap';
import RoomOptions from '../components/hotel/RoomOptions';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import { useFetchHotelPricesForDetails } from '../hooks/hotel_details/useFetchHotelPricesForDetails';
import { useFetchHotelRoomPrices } from '../hooks/hotel_details/useFetchHotelRoomPrices';
import { useFetchHotelsForDetails } from '../hooks/hotel_details/useFetchHotelsForDetails';
import { usePricedHotelsForDetails } from '../hooks/hotel_details/usePricedHotelsForDetails';

// Data types
type Hotel = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address1: string;
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
  occupancy?: number;
  bed_type?: string;
  size?: string;
  description?: string;
  long_description?: string;
  amenities?: string[];
  key?: string;
  availability?: number;
};

type AvailabilityInfo = {
  requestedRooms: number;
  availableRooms: number;
  validRoomCount: number;
  requestedAdults: number;
  requestedChildren: number;
  totalRequestedGuests: number;
  maxGuestCapacity: number;
  validGuestCapacity: number;
  validAdults: number;
  validChildren: number;
};

type ApiResponse = {
  hotel: Hotel;
  rooms: Room[];
  availability: AvailabilityInfo;
};

const HotelDetail = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [specificHotel, setSpecificHotel] = useState<any>(null);
  const { hotelId: pathHotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  
  // Get hotelId from either path parameter or query parameter
  const hotelId = pathHotelId || searchParams.get('hotelId')?.replace(/"/g, '') || '';
  
  console.log('Path hotelId:', pathHotelId);
  console.log('Query hotelId:', searchParams.get('hotelId'));
  console.log('Final hotelId:', hotelId);

        // Get URL parameters from listing page (remove quotes from values)
        const destinationId = searchParams.get('destination_id')?.replace(/"/g, '') || searchParams.get('destId')?.replace(/"/g, '') || 'WD0M';
        
        // Parse dates with proper fallbacks
        const getDateFromParams = (paramName: string, fallback: string) => {
          const param = searchParams.get(paramName)?.replace(/"/g, '');
          if (param && param.trim() !== '') {
            const date = new Date(param);
            if (!isNaN(date.getTime())) {
              return param;
            }
          }
          return fallback;
        };
        
        const checkin = getDateFromParams('checkin', '2025-08-12');
        const checkout = getDateFromParams('checkout', '2025-08-30');
  
        // Parse adults and children from URL (note: 'adult' and 'child' not 'adults' and 'children')
        const adults = searchParams.get('adults') || searchParams.get('adult') || '2';
        const children = searchParams.get('children') || searchParams.get('child') || '0';
        const roomCount = searchParams.get('rooms') || searchParams.get('room') || '1';
        
        // Log URL parameters for testing
        console.log('destination_id:', destinationId);
        console.log('checkin:', checkin);
        console.log('checkout:', checkout);
        console.log('adults:', adults);
        console.log('children:', children);
        console.log('rooms:', roomCount);
  
  console.log('Debug - URL Parameters:', {
    destinationId,
    checkin,
    checkout,
    adults: searchParams.get('adults') || searchParams.get('adult'),
    children: searchParams.get('children') || searchParams.get('child'),
    rooms: searchParams.get('rooms') || searchParams.get('room')
  });
  
  console.log('Debug - destinationId:', destinationId);
  console.log('Debug - checkin:', checkin);
  console.log('Debug - checkout:', checkout);
        const lang = searchParams.get('lang') || 'en_US';
        const currency = searchParams.get('currency') || 'SGD';
        const countryCode = searchParams.get('country_code') || 'SG';
        
        // Calculate total guests (adults + children)
        const totalGuests = parseInt(adults) + parseInt(children);

  // Convert URL parameters to the format expected by the hooks
  const stayDates: StayDatesState = {
    checkinDate: new Date(checkin),
    checkoutDate: new Date(checkout)
  };

  const occupancy: OccupancyState = {
    adults: parseInt(adults),
    children: parseInt(children),
    rooms: parseInt(roomCount)
  };

  // Use the same hooks as the listing page
  const { hotels, loading: hotelLoading } = useFetchHotelsForDetails([destinationId]);
  const { prices, loading: priceLoading } = useFetchHotelPricesForDetails(
    [destinationId],
    stayDates,
    occupancy,
    2000
  );
  const pricedHotels = usePricedHotelsForDetails(hotels, prices);

  // Use the new hook for detailed room prices (disabled since external API doesn't support individual hotel prices)
  const { rooms: roomPrices, loading: roomPricesLoading } = useFetchHotelRoomPrices({
    hotelId,
          destinationId,
          checkin,
          checkout,
    guests: adults,
    enabled: true // Enable to try to get detailed room data
  });

  // useEffect to set specificHotel when data changes
  useEffect(() => {
    if (!hotelId || hotelLoading || priceLoading) return;

    // Find the specific hotel we're looking for
    const foundHotel = pricedHotels.find(hotel => hotel.id === hotelId);
    
    // If hotel not found in pricedHotels, try to find it in the hotels array
    if (!foundHotel) {
      const hotelFromHotels = hotels.find(hotel => hotel.id === hotelId);
      if (hotelFromHotels) {
        console.log('Debug - Hotel found in hotels array but not in pricedHotels, creating basic hotel object');
        // Create a basic hotel object with the data from hotels array
        const basicHotel = {
          ...hotelFromHotels,
          price: 0,
          lowest_price: 0,
          price_type: 'unknown',
          rooms_available: 0,
          free_cancellation: false,
          // Add missing properties required by PricedHotel type
          searchRank: 0,
          max_cash_payment: 0,
          coverted_max_cash_payment: 0,
          points: 0,
          bonuses: 0,
          // Add any other required fields with defaults
        } as any; // Use type assertion to avoid TypeScript errors
        setSpecificHotel(basicHotel);
      }
    } else {
      setSpecificHotel(foundHotel);
    }
    
    // If hotel still not found, use the first available hotel as fallback
    if (!foundHotel && !specificHotel && pricedHotels.length > 0) {
      console.log('Debug - Using fallback hotel:', pricedHotels[0]?.id);
      setSpecificHotel(pricedHotels[0]);
    }
    
    // If still no hotel found, try to use the first hotel from hotels array
    if (!foundHotel && !specificHotel && hotels.length > 0) {
      console.log('Debug - Using fallback hotel from hotels array:', hotels[0]?.id);
      const fallbackHotel = hotels[0];
      const fallbackHotelData = {
        ...fallbackHotel,
        price: 0,
        lowest_price: 0,
        price_type: 'unknown',
        rooms_available: 0,
        free_cancellation: false,
        // Add missing properties required by PricedHotel type
        searchRank: 0,
        max_cash_payment: 0,
        coverted_max_cash_payment: 0,
        points: 0,
        bonuses: 0,
      } as any; // Use type assertion to avoid TypeScript errors
      setSpecificHotel(fallbackHotelData);
    }
  }, [hotelId, hotels, pricedHotels, hotelLoading, priceLoading, specificHotel]);

  console.log('Debug - Hooks Status:', {
    hotelLoading,
    priceLoading,
    hotelsCount: hotels.length,
    pricesCount: prices.length,
    pricedHotelsCount: pricedHotels.length,
    specificHotelFound: !!specificHotel,
    hotelId,
    destinationId
  });
  
  console.log('Debug - hotelLoading:', hotelLoading);
  console.log('Debug - priceLoading:', priceLoading);
  console.log('Debug - hotelsCount:', hotels.length);
  console.log('Debug - pricesCount:', prices.length);
  console.log('Debug - pricedHotelsCount:', pricedHotels.length);
  console.log('Debug - specificHotelFound:', !!specificHotel);
  console.log('Debug - hotelId:', hotelId);
  
  // Debug: Show available hotel IDs
  if (hotels.length > 0) {
    console.log('Debug - Available hotel IDs (first 10):', hotels.slice(0, 10).map(h => h.id));
    console.log('Debug - Looking for hotel ID:', hotelId);
    console.log('Debug - Hotel found by ID:', hotels.find(h => h.id === hotelId));
    
    // If hotel not found, suggest using the first available hotel
    if (!hotels.find(h => h.id === hotelId)) {
      console.log('Debug - Hotel not found, suggesting first available hotel:', hotels[0]?.id);
      console.log('Debug - First hotel details:', hotels[0]);
    }
  }

  // Simple loading state management
  useEffect(() => {
    if (hotelLoading || priceLoading || roomPricesLoading) {
      setLoading(true);
    } else if (data) {
      setLoading(false);
    }
  }, [hotelLoading, priceLoading, roomPricesLoading, data]);

  // Simplified data processing effect - only run when all hooks are ready
  useEffect(() => {
    // Don't process if we already have data or if hooks are still loading
    if (data || hotelLoading || priceLoading || roomPricesLoading) {
      return;
    }
    
    // Show complete page only when all data including room prices is loaded
    if (!hotelLoading && !priceLoading && !roomPricesLoading && data) {
      console.log('🎯 ALL DATA READY: Main data + room prices loaded, showing complete page');
      setLoading(false);
      return;
    }

    // Don't process if we don't have a specific hotel
    if (!specificHotel) {
      if (hotelId && hotels.length > 0) {
        setError(`Hotel with ID ${hotelId} not found in destination ${destinationId}`);
      } else if (hotels.length === 0) {
        setError('No hotels available for the selected destination');
      }
      setLoading(false);
      return;
    }

    // Process hotel data once when all hooks are ready
    console.log('🎯 Processing hotel data - all hooks ready');
    
    try {
      setLoading(true);
      setError(null);

      // Extract amenities from hotel description if amenities object is empty
      const extractAmenitiesFromDescription = (description: string) => {
        const amenities: Record<string, boolean> = {};
        const lowerDescription = description.toLowerCase();
        
        const amenityKeywords = [
          { keyword: 'wifi', amenity: 'wifi' },
          { keyword: 'wireless internet', amenity: 'wifi' },
          { keyword: 'pool', amenity: 'pool' },
          { keyword: 'indoor pool', amenity: 'pool' },
          { keyword: 'hot tub', amenity: 'hotTub' },
          { keyword: 'fitness center', amenity: 'fitness' },
          { keyword: 'gym', amenity: 'fitness' },
          { keyword: 'breakfast', amenity: 'breakfast' },
          { keyword: 'continental breakfast', amenity: 'breakfast' },
          { keyword: 'buffet breakfast', amenity: 'breakfast' },
          { keyword: 'parking', amenity: 'parking' },
          { keyword: 'free parking', amenity: 'parking' },
          { keyword: 'self parking', amenity: 'parking' },
          { keyword: 'business center', amenity: 'businessCenter' },
          { keyword: 'air conditioning', amenity: 'airConditioning' },
          { keyword: 'tv', amenity: 'tVInRoom' },
          { keyword: 'television', amenity: 'tVInRoom' },
          { keyword: 'flat-screen', amenity: 'tVInRoom' },
          { keyword: 'refrigerator', amenity: 'refrigerator' },
          { keyword: 'refrigerators', amenity: 'refrigerator' },
          { keyword: 'microwave', amenity: 'microwave' },
          { keyword: 'microwaves', amenity: 'microwave' },
          { keyword: 'kitchen', amenity: 'kitchen' },
          { keyword: 'hair dryer', amenity: 'hairDryer' },
          { keyword: 'hair dryers', amenity: 'hairDryer' },
          { keyword: 'safe', amenity: 'safe' },
          { keyword: 'room service', amenity: 'roomService' },
          { keyword: 'concierge', amenity: 'concierge' },
          { keyword: 'express check-in', amenity: 'expressCheckin' },
          { keyword: 'express check-out', amenity: 'expressCheckout' },
          { keyword: 'vending machine', amenity: 'vendingMachine' }
        ];
        
        amenityKeywords.forEach(({ keyword, amenity }) => {
          if (lowerDescription.includes(keyword)) {
            amenities[amenity] = true;
          }
        });
        
        return amenities;
      };

      // Transform hotel data
      const hotel: Hotel = {
        id: specificHotel.id,
        name: specificHotel.name,
        rating: specificHotel.rating,
        reviewCount: 2847,
        address1: specificHotel.address,
        description: specificHotel.description || 'No description provided.',
        amenities: Object.keys(specificHotel.amenities || {}).length > 0 
          ? specificHotel.amenities 
          : extractAmenitiesFromDescription(specificHotel.description || ''),
        images: specificHotel.image_details && specificHotel.image_details.count > 0 ? 
          Array.from({ length: Math.min(specificHotel.image_details.count, 5) }, (_, i) => {
            const imageUrl = `${specificHotel.image_details.prefix}${i}${specificHotel.image_details.suffix}`;
            if (imageUrl.includes('undefined') || imageUrl.includes('null') || !imageUrl.startsWith('http')) {
              return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=900&fit=crop&q=85';
            }
            return imageUrl;
          })
        : [
            'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=900&fit=crop&q=85',
            'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85',
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=900&fit=crop&q=85'
          ],
        latitude: specificHotel.latitude,
        longitude: specificHotel.longitude
      };

      // Transform room data from hotel pricing information
      let roomData: Room[] = [];
      
      if (roomPrices && roomPrices.length > 0) {
        // Filter out duplicates
        const uniqueRoomPrices = roomPrices.filter((roomPrice, index, array) => {
          for (let i = 0; i < index; i++) {
            const type1 = (roomPrice.room_normalized_description || '').replace(/\s*\([^)]*\)/g, '').replace(/\s*\d+$/g, '').trim();
            const type2 = (array[i].room_normalized_description || '').replace(/\s*\([^)]*\)/g, '').replace(/\s*\d+$/g, '').trim();
            const priceDiff = Math.abs(roomPrice.price - array[i].price) / Math.max(roomPrice.price, array[i].price);
            if (type1 === type2 && priceDiff < 0.1) return false;
          }
          return true;
        });
        
        uniqueRoomPrices.forEach((roomPrice, index) => {
          const roomDescription = roomPrice.room_normalized_description || '';
          const bedType = roomDescription.includes('Double') ? 'Double bed' :
                         roomDescription.includes('King') ? 'King bed' :
                         roomDescription.includes('Queen') ? 'Queen bed' :
                         roomDescription.includes('Twin') ? 'Twin beds' : 'King bed';
          
          let roomImageUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85';
          
          if (roomPrice.images && roomPrice.images.length > 0) {
            const validImage = roomPrice.images.find((img: any) => {
              if (typeof img === 'string') {
                return img && img.trim() !== '' && img !== 'undefined' && img !== 'null';
              } else if (img && typeof img === 'object' && 'url' in img) {
                return img.url && img.url.trim() !== '' && img.url !== 'undefined' && img.url !== 'null';
              }
              return false;
            });
            
            if (validImage) {
              roomImageUrl = typeof validImage === 'string' ? validImage : (validImage as any).url;
            }
          }
          
          roomData.push({
            id: roomPrice.key || `${specificHotel.id}-${index}`,
            room_type: roomPrice.room_normalized_description || 'Standard Room',
            price: roomPrice.price,
            free_cancellation: roomPrice.free_cancellation,
            image: roomImageUrl,
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: bedType,
            size: '35',
            description: roomPrice.description || 'Comfortable room with modern amenities',
            long_description: roomPrice.long_description || 'A well-appointed room featuring modern amenities and comfortable furnishings.',
            amenities: roomPrice.amenities || ['WiFi', 'TV', 'Air Conditioning'],
            key: roomPrice.key
          });
        });
      }
      
      if (roomData.length === 0) {
        throw new Error('Room information is required but not available. Please try again.');
      }

      // Validate room availability and guest capacity
      const requestedRooms = parseInt(roomCount);
      const requestedAdults = parseInt(adults);
      const requestedChildren = parseInt(children);
      const totalRequestedGuests = totalGuests;
      
      const totalAvailableRooms = specificHotel.rooms_available || roomData.length;
      const maxGuestCapacity = roomData.reduce((total, room) => total + (room.occupancy || 2), 0);
      
      const validRoomCount = Math.min(requestedRooms, totalAvailableRooms);
      const validGuestCapacity = Math.min(totalRequestedGuests, maxGuestCapacity);
      
      let validAdults = requestedAdults;
      let validChildren = requestedChildren;
      
      if (totalRequestedGuests > validGuestCapacity) {
        const ratio = validGuestCapacity / totalRequestedGuests;
        validAdults = Math.floor(requestedAdults * ratio);
        validChildren = validGuestCapacity - validAdults;
      }

      setData({ 
        hotel, 
        rooms: roomData,
        availability: {
          requestedRooms,
          availableRooms: totalAvailableRooms,
          validRoomCount,
          requestedAdults,
          requestedChildren,
          totalRequestedGuests,
          maxGuestCapacity,
          validGuestCapacity,
          validAdults,
          validChildren
        }
      });
      
      console.log('✅ Hotel data processed successfully');
      
    } catch (err) {
      console.error('Error processing hotel data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [hotelId, specificHotel, hotelLoading, priceLoading, roomPricesLoading, hotels, destinationId, checkin, checkout, adults, children, roomCount, totalGuests, searchParams, data]);



  console.log('Rendering check - loading:', loading, 'error:', error, 'data:', !!data);

  if (loading) {
    if (!hotelLoading && !priceLoading && roomPricesLoading) {
      console.log('🏠 Waiting for room prices and images to finish loading...');
    }
    
    return (
      <div className="hotel-detail-page min-h-screen bg-background" data-cy="hotel-detail">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto mb-4"></div>
            <p className="text-hotel-text-secondary">Loading hotel details...</p>
            {!hotelLoading && !priceLoading && roomPricesLoading && (
              <p className="text-xs text-hotel-text-secondary mt-1">
                🏠 Fetching room details and images...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hotel-detail-page min-h-screen bg-background" data-cy="hotel-detail">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <div className="mb-4 text-sm text-hotel-text-secondary">
              <p>Try using a valid hotel ID from the listing page.</p>
              <p>Current destination: {destinationId}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary hover:underline"
            >
              Try again
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="hotel-detail-page min-h-screen bg-background" data-cy="hotel-detail">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <p className="text-hotel-text-secondary">No hotel data available</p>
        </div>
      </div>
    );
  }

  console.log(`🎉 SUCCESS: Rendering HotelDetail with data!`);
  console.log('Rendering HotelDetail with price:', data.rooms.length > 0 ? data.rooms[0].price : 0, 'and rooms:', data.rooms);
  console.log('Hotel coordinates:', { lat: data.hotel.latitude, lng: data.hotel.longitude });
  console.log('Room data for display:', data.rooms[0]);
  console.log('Hotel data for display:', data.hotel);
  
  return (
    <div className="hotel-detail-page" data-cy="hotel-detail">
      <HotelHeader />
      
      <main className="min-h-screen bg-background max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Hotel Title & Rating */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-hotel-border-light">
          <h1 className="text-3xl font-bold mb-3 text-gray-900" data-cy="hotel-name">{data.hotel.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  className={i < Math.floor(data.hotel.rating) ? "fill-hotel-gold text-hotel-gold" : "text-muted-foreground"} 
                />
              ))}
              <span className="ml-2 font-semibold text-lg">{data.hotel.rating}</span>
            </div>
            <span className="text-hotel-text-secondary text-lg">({data.hotel.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Main Content - Full Width Layout */}
        <div className="space-y-8">
          {/* Hotel Images and Info */}
          <div className="space-y-8">
            <HotelImageGallery 
              images={data.hotel.images} 
              hotelName={data.hotel.name} 
            />
            <HotelInfo hotel={data.hotel} />
          </div>
        </div>

        {/* Room Options */}
        <div data-cy="room-options">
          {data.rooms.length > 0 ? (
            <RoomOptions 
              rooms={data.rooms} 
              hotelId={hotelId}
              hotelName={data.hotel.name}
              hotelRating={data.hotel.rating}
              hotelReviewCount={data.hotel.reviewCount}
              totalAvailableRooms={data.availability.availableRooms}
              onSelectRoom={(room) => {
                setSelectedRoom(room);
                // Scroll to booking card
                const bookingCard = document.getElementById('booking-card');
                if (bookingCard) {
                  bookingCard.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
              <p className="text-gray-600 mb-4">
                No rooms are currently available for the selected dates and parameters.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Try different dates or contact the hotel directly.</p>
                <p>You can also check back later for availability updates.</p>
              </div>
            </div>
          )}
        </div>

        {/* Full Width Booking Card - Below Available Rooms */}
        <div id="booking-card">
          <BookingCard 
            price={selectedRoom ? selectedRoom.price : (data.rooms.length > 0 ? data.rooms[0].price : 0)}
            rating={data.hotel.rating}
            reviewCount={data.hotel.reviewCount}
            hotelName={data.hotel.name}
            hotelId={hotelId}
            hotelAddress={data.hotel.address1} // Add hotel address
            hasRooms={data.rooms.length > 0}
            availability={data.availability}
            selectedRoom={selectedRoom}
            hotelImages={data.hotel.images} // Pass actual hotel images
          />
        </div>

        {/* Location */}
        <div>
          <LocationMap 
            address={data.hotel.address1} 
            latitude={data.hotel.latitude}
            longitude={data.hotel.longitude}
            hotelName={data.hotel.name}
          />
        </div>
      </main>
    </div>
  );
};

export default HotelDetail;