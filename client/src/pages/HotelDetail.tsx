import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import HotelHeader from '../components/hotel/HotelHeader';
import HotelImageGallery from '../components/hotel/HotelImageGallery';
import BookingCard from '../components/hotel/BookingCard';
import HotelInfo from '../components/hotel/HotelInfo';
import RoomOptions from '../components/hotel/RoomOptions';
import LocationMap from '../components/hotel/LocationMap';
import { Star } from 'lucide-react';

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
  occupancy: number;
  bed_type: string;
  size: string;
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
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchHotelData = async () => {
      if (!hotelId) {
        setError('No hotel ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get URL parameters from listing page
        const destinationId = searchParams.get('destId') || 'WD0M';
        const checkin = searchParams.get('checkin') || '2025-10-01';
        const checkout = searchParams.get('checkout') || '2025-10-07';
        
        // Parse adults and children from URL (note: 'adult' and 'child' not 'adults' and 'children')
        const adults = searchParams.get('adult') || '2';
        const children = searchParams.get('child') || '0';
        const roomCount = searchParams.get('room') || '1';
        const lang = searchParams.get('lang') || 'en_US';
        const currency = searchParams.get('currency') || 'SGD';
        const countryCode = searchParams.get('country_code') || 'SG';
        
        // Calculate total guests (adults + children)
        const totalGuests = parseInt(adults) + parseInt(children);

        // Build guests string for API - format: "guests_per_room|guests_per_room" for each room
        const guestsPerRoom = Math.ceil(totalGuests / parseInt(roomCount));
        const guests = Array(parseInt(roomCount)).fill(guestsPerRoom).join('|');
        
        console.log('URL Parameters received:', {
          adultParam: searchParams.get('adult'),
          childParam: searchParams.get('child'),
          roomParam: searchParams.get('room'),
          destIdParam: searchParams.get('destId'),
          parsedAdults: adults,
          parsedChildren: children,
          parsedRooms: roomCount,
          totalGuests,
          guestsPerRoom,
          guestsString: guests
        });

        // Fetch combined hotel data
        const response = await fetch(`/api/hotel-detail/combined/${hotelId}?${new URLSearchParams({
          destination_id: destinationId,
          checkin,
          checkout,
          guests,
          lang,
          currency,
          country_code: countryCode
        })}`);

        if (!response.ok) {
          throw new Error(`Error fetching hotel data: ${response.status}`);
        }

        const result = await response.json();

        // Transform hotel data
        const hotel: Hotel = {
          id: result.hotel.id,
          name: result.hotel.name,
          rating: result.hotel.rating,
          reviewCount: 2847, // Default value since API doesn't provide this
          address1: result.hotel.address,
          description: result.hotel.description || 'No description provided.',
          amenities: result.hotel.amenities || {},
          images: result.hotel.image_details ? 
            Array.from({ length: Math.min(result.hotel.image_details.count, 5) }, (_, i) => 
              `${result.hotel.image_details.prefix}${i}${result.hotel.image_details.suffix}`
            ) : [
              'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
              'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
              'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
            ],
          latitude: result.hotel.latitude,
          longitude: result.hotel.longitude
        };

        // Transform room data
        const roomData: Room[] = result.prices?.rooms?.map((room: Record<string, unknown>, index: number) => {
          console.log(`Room ${index}:`, room); // Debug logging
          return {
            id: (room.key as string) || `room-${index}`,
            room_type: (room.room_normalized_description as string) || 'Room',
            price: Math.round((room.price as number) || 0),
            free_cancellation: (room.free_cancellation as boolean) || false,
            image: ((room.images as string[])?.[0]) || `https://images.unsplash.com/photo-${['1649972904349-6e44c42644a7', '1581091226825-a6a2a5aee158', '1721322800607-8c38375eef04'][index % 3]}?w=600&h=400&fit=crop`,
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed', // Default value
            size: '35', // Default value
            description: room.description as string,
            long_description: room.long_description as string,
            amenities: room.amenities as string[],
            key: room.key as string
          };
        }) || [];

        // If no rooms are available, create a default room for demo purposes
        if (roomData.length === 0) {
          roomData.push({
            id: 'demo-room-1',
            room_type: 'Deluxe Room',
            price: 150,
            free_cancellation: true,
            image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed',
            size: '35',
            description: 'Comfortable room with modern amenities',
            long_description: 'Spacious deluxe room featuring a king-size bed, modern bathroom, and city views.',
            amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar'],
            key: 'demo-room-1'
          });
        }

        // Validate room availability and guest capacity
        const requestedRooms = parseInt(roomCount);
        const requestedAdults = parseInt(adults);
        const requestedChildren = parseInt(children);
        const totalRequestedGuests = totalGuests; // Use the calculated total
        
        // Calculate total available rooms and guest capacity
        const totalAvailableRooms = roomData.length;
        const maxGuestCapacity = roomData.reduce((total, room) => total + room.occupancy, 0);
        
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

    fetchHotelData();
  }, [hotelId, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-hotel-text-secondary">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
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
      <div className="min-h-screen bg-background">
        <HotelHeader />
        <div className="flex items-center justify-center h-96">
          <p className="text-hotel-text-secondary">No hotel data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HotelHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hotel Title & Rating */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{data.hotel.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  className={i < Math.floor(data.hotel.rating) ? "fill-hotel-gold text-hotel-gold" : "text-muted-foreground"} 
                />
              ))}
              <span className="ml-2 font-medium">{data.hotel.rating}</span>
            </div>
            <span className="text-hotel-text-secondary">({data.hotel.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Images and Info */}
          <div className="lg:col-span-2 space-y-8">
            <HotelImageGallery 
              images={data.hotel.images} 
              hotelName={data.hotel.name} 
            />
            <HotelInfo hotel={data.hotel} />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard 
              price={data.rooms.length > 0 ? data.rooms[0].price : 0}
              rating={data.hotel.rating}
              reviewCount={data.hotel.reviewCount}
              hotelName={data.hotel.name}
              hotelId={hotelId}
              hasRooms={data.rooms.length > 0}
              availability={data.availability}
            />
          </div>
        </div>

        {/* Room Options */}
        <div className="mb-12">
          {data.rooms.length > 0 ? (
            <RoomOptions rooms={data.rooms} />
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

        {/* Location */}
        <div className="mb-12">
          <LocationMap address={data.hotel.address1} />
        </div>
      </main>
    </div>
  );
};

export default HotelDetail;
