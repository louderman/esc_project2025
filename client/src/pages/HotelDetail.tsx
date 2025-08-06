import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import HotelHeader from '../components/hotel/HotelHeader';
import HotelImageGallery from '../components/hotel/HotelImageGallery';
import BookingCard from '../components/hotel/BookingCard';
import HotelInfo from '../components/hotel/HotelInfo';
import RoomOptions from '../components/hotel/RoomOptions';
import LocationMap from '../components/hotel/LocationMap';
import { Star } from 'lucide-react';
import { useFetchHotelPrices } from '../hooks/hotels/useFetchHotelPrices';
import { useFetchHotels } from '../hooks/hotels/useFetchHotels';
import { usePricedHotels } from '../hooks/hotels/usePricedHotels';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';

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
  const { hotelId: pathHotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  
  // Get hotelId from either path parameter or query parameter
  const hotelId = pathHotelId || searchParams.get('hotelId')?.replace(/"/g, '') || '';
  
  console.log('Path hotelId:', pathHotelId);
  console.log('Query hotelId:', searchParams.get('hotelId'));
  console.log('Final hotelId:', hotelId);

  // Get URL parameters from listing page (remove quotes from values)
  const destinationId = searchParams.get('destination_id')?.replace(/"/g, '') || searchParams.get('destId')?.replace(/"/g, '') || 'WD0M';
  const checkin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
  const checkout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
  
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
  
  // Parse adults and children from URL (note: 'adult' and 'child' not 'adults' and 'children')
  const adults = searchParams.get('adults') || searchParams.get('adult') || '2';
  const children = searchParams.get('children') || searchParams.get('child') || '0';
  const roomCount = searchParams.get('rooms') || searchParams.get('room') || '1';
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
  const { hotels, loading: hotelLoading } = useFetchHotels([destinationId]);
  const { prices, loading: priceLoading } = useFetchHotelPrices(
    [destinationId],
    stayDates,
    occupancy,
    2000
  );
  const pricedHotels = usePricedHotels(hotels, prices);

  // Find the specific hotel we're looking for
  let specificHotel = pricedHotels.find(hotel => hotel.id === hotelId);
  
  // If hotel not found, use the first available hotel as fallback
  if (!specificHotel && pricedHotels.length > 0) {
    console.log('Debug - Using fallback hotel:', pricedHotels[0]?.id);
    specificHotel = pricedHotels[0];
  }
  
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

  useEffect(() => {
    console.log('useEffect triggered - hotelLoading:', hotelLoading, 'priceLoading:', priceLoading, 'specificHotel:', !!specificHotel);
    
    // Set loading to true when hooks are loading
    if (hotelLoading || priceLoading) {
      console.log('Setting loading to true - hooks are loading');
      setLoading(true);
      return;
    }

    const fetchHotelData = async () => {
      if (!hotelId) {
        setError('No hotel ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Add a small delay to ensure loading state is visible
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use the hooks data instead of manual fetching
        if (!specificHotel) {
          throw new Error(`Hotel with ID ${hotelId} not found in destination ${destinationId}. Available hotels: ${hotels.length}`);
        }

        console.log('Found specific hotel with pricing:', specificHotel);
        console.log('Hotel images:', specificHotel.image_details);
        console.log('Hotel amenities:', specificHotel.amenities);

        // Transform hotel data
        const hotel: Hotel = {
          id: specificHotel.id,
          name: specificHotel.name,
          rating: specificHotel.rating,
          reviewCount: 2847, // Default value since API doesn't provide this
          address1: specificHotel.address,
          description: specificHotel.description || 'No description provided.',
          amenities: specificHotel.amenities || {},
          images: specificHotel.image_details ? 
            Array.from({ length: Math.min(specificHotel.image_details.count, 5) }, (_, i) => {
              const imageUrl = `${specificHotel.image_details.prefix}${i}${specificHotel.image_details.suffix}`;
              console.log(`Generated image URL ${i}:`, imageUrl);
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

        // Transform room data from the priced hotel
        let roomData: Room[] = [];
        
        if (specificHotel.price || specificHotel.lowest_price) {
          const price = Math.round((specificHotel.price || specificHotel.lowest_price) as number);
          const roomType = specificHotel.price_type || 'Standard Room';
          const freeCancellation = specificHotel.free_cancellation || false;
          
                  console.log('Extracted price for hotel:', price);
        console.log('Room type:', roomType);
        console.log('Number of nights:', Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)));
        console.log('Price per night:', price / Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)));
          
                      roomData = [{
              id: specificHotel.id,
              room_type: roomType,
              price: price,
              free_cancellation: freeCancellation,
              image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed',
            size: '35',
            description: 'Standard room with modern amenities',
            long_description: 'Comfortable room with all necessary amenities for a pleasant stay',
            amenities: ['WiFi', 'TV', 'Air Conditioning'],
            key: specificHotel.id
          }];
        } else {
          console.log('No pricing data found for this hotel');
          // If no pricing data, show that pricing is not available
          roomData.push({
            id: hotelId,
            room_type: 'Standard Room',
            price: 0, // Indicate no pricing available
            free_cancellation: false,
            image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed',
            size: '35',
            description: 'Standard room with modern amenities',
            long_description: 'Comfortable room with all necessary amenities for a pleasant stay. Pricing information is not currently available for this hotel.',
            amenities: ['WiFi', 'TV', 'Air Conditioning'],
            key: hotelId
          });
        }

        // Validate room availability and guest capacity
        const requestedRooms = parseInt(roomCount);
        const requestedAdults = parseInt(adults);
        const requestedChildren = parseInt(children);
        const totalRequestedGuests = totalGuests; // Use the calculated total
        
        // Calculate total available rooms and guest capacity
        const totalAvailableRooms = roomData.length;
        const maxGuestCapacity = roomData.reduce((total, room) => total + (room.occupancy || 2), 0);
        
        // Validate room count
        const validRoomCount = Math.min(requestedRooms, totalAvailableRooms);
        
        // Validate guest capacity
        const validGuestCapacity = Math.min(totalRequestedGuests, maxGuestCapacity);
        
        // Calculate valid guests per room
        const validGuestsPerRoom = Math.ceil(validGuestCapacity / validRoomCount);
        
        // Adjust adults and children proportionally if needed
        let validAdults = requestedAdults;
        let validChildren = requestedChildren;
        
        if (totalRequestedGuests > validGuestCapacity) {
          const ratio = validGuestCapacity / totalRequestedGuests;
          validAdults = Math.floor(requestedAdults * ratio);
          validChildren = validGuestCapacity - validAdults;
        }

        console.log('Availability validation:', {
          requestedRooms,
          totalAvailableRooms,
          validRoomCount,
          requestedAdults,
          requestedChildren,
          totalRequestedGuests,
          maxGuestCapacity,
          validGuestCapacity,
          validAdults,
          validChildren
        });

        console.log('Parsed URL parameters:', {
          destinationId,
          checkin,
          checkout,
          adults: validAdults.toString(),
          children: validChildren.toString(),
          roomCount: validRoomCount.toString(),
          totalGuests: validGuestCapacity,
          guestsPerRoom: validGuestsPerRoom,
          guests: Array(validRoomCount).fill(validGuestsPerRoom).join('|')
        });

        console.log('Number of rooms available:', roomData.length); // Debug logging

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when hooks have loaded and we have a specific hotel
    console.log('Checking fetch conditions - hotelLoading:', hotelLoading, 'priceLoading:', priceLoading, 'specificHotel:', !!specificHotel);
    
    if (!hotelLoading && !priceLoading && specificHotel) {
      console.log('Fetching hotel data...');
      fetchHotelData();
    } else if (!hotelLoading && !priceLoading && !specificHotel && hotelId) {
      console.log('Hotel not found, setting error');
      setError(`Hotel with ID ${hotelId} not found`);
      setLoading(false);
    } else {
      console.log('No fetch conditions met, setting loading to false');
      setLoading(false);
    }
  }, [hotelId, specificHotel, hotelLoading, priceLoading, destinationId, checkin, checkout, adults, children, roomCount, totalGuests, searchParams]);

  console.log('Rendering check - loading:', loading, 'error:', error, 'data:', !!data);
  
  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="hotel-detail-page min-h-screen bg-background">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto mb-4"></div>
            <p className="text-hotel-text-secondary">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hotel-detail-page min-h-screen bg-background">
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
      <div className="hotel-detail-page min-h-screen bg-background">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <p className="text-hotel-text-secondary">No hotel data available</p>
        </div>
      </div>
    );
  }

  console.log('Rendering HotelDetail with price:', data.rooms.length > 0 ? data.rooms[0].price : 0, 'and rooms:', data.rooms);
  console.log('Hotel coordinates:', { lat: data.hotel.latitude, lng: data.hotel.longitude });
  console.log('Room data for display:', data.rooms[0]);
  console.log('Hotel data for display:', data.hotel);
  
  return (
    <div className="hotel-detail-page">
      <HotelHeader />
      
      <main className="min-h-screen bg-background max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Hotel Title & Rating */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-hotel-border-light">
          <h1 className="text-3xl font-bold mb-3 text-gray-900">{data.hotel.name}</h1>
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
        <div>
          {data.rooms.length > 0 ? (
            <RoomOptions 
              rooms={data.rooms} 
              hotelId={hotelId}
              hotelName={data.hotel.name}
              hotelRating={data.hotel.rating}
              hotelReviewCount={data.hotel.reviewCount}
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
            hasRooms={data.rooms.length > 0}
            availability={data.availability}
            selectedRoom={selectedRoom}
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
