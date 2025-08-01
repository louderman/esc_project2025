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
  const { hotelId: pathHotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  
  // Get hotelId from either path parameter or query parameter
  const hotelId = pathHotelId || searchParams.get('hotelId')?.replace(/"/g, '') || '';
  
  console.log('Path hotelId:', pathHotelId);
  console.log('Query hotelId:', searchParams.get('hotelId'));
  console.log('Final hotelId:', hotelId);

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

        // Get URL parameters from listing page (remove quotes from values)
        const destinationId = searchParams.get('destination_id')?.replace(/"/g, '') || searchParams.get('destId')?.replace(/"/g, '') || 'WD0M';
        const checkin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
        const checkout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
        
        // Parse adults and children from URL (note: 'adult' and 'child' not 'adults' and 'children')
        const adults = searchParams.get('adults') || searchParams.get('adult') || '2';
        const children = searchParams.get('children') || searchParams.get('child') || '0';
        const roomCount = searchParams.get('rooms') || searchParams.get('room') || '1';
        const lang = searchParams.get('lang') || 'en_US';
        const currency = searchParams.get('currency') || 'SGD';
        const countryCode = searchParams.get('country_code') || 'SG';
        
        // Calculate total guests (adults + children)
        const totalGuests = parseInt(adults) + parseInt(children);

        // Use simple guest count like ListingPage does
        const guests = totalGuests.toString();
        
        console.log('Parsed parameters:', {
          destinationId,
          checkin,
          checkout,
          adults,
          children,
          totalGuests,
          guests,
          roomCount
        });
        
        console.log('URL Parameters received:', {
          adultParam: searchParams.get('adult'),
          childParam: searchParams.get('child'),
          roomParam: searchParams.get('room'),
          destIdParam: searchParams.get('destId'),
          parsedAdults: adults,
          parsedChildren: children,
          parsedRooms: roomCount,
          totalGuests,
          guestsString: guests
        });

                // Fetch hotel details (like listing page does)
        const hotelUrl = `/api/hotel/query?dest_id=${destinationId}`;
        console.log('Hotel API URL:', hotelUrl);
        const hotelResponse = await fetch(hotelUrl);

        if (!hotelResponse.ok) {
          throw new Error(`Error fetching hotel data: ${hotelResponse.status}`);
        }

        const allHotels = await hotelResponse.json();
        console.log('Hotel API Response:', allHotels);
        
        // Find the specific hotel
        const specificHotel = allHotels.find((h: any) => h.id === hotelId);
        if (!specificHotel) {
          throw new Error(`Hotel ${hotelId} not found in destination ${destinationId}`);
        }
        
        // Fetch prices with polling (like listing page does)
        let prices = [];
        let attempts = 0;
        const maxAttempts = 10; // Poll for up to 20 seconds
        
        while (attempts < maxAttempts) {
          const priceUrl = `/api/hotel-price/query?dest_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
          console.log(`Price API URL (attempt ${attempts + 1}):`, priceUrl);
          
          const priceResponse = await fetch(priceUrl);
          
          if (priceResponse.ok) {
            const data = await priceResponse.json();
            console.log(`Price API Response (attempt ${attempts + 1}):`, data);
            
            if (data.completed) {
              prices = data.hotels;
              console.log('Price API completed, stopping polling');
              break;
            } else {
              console.log('Price API not completed yet, waiting 2 seconds...');
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } else {
            console.log('Price API error, stopping polling');
            break;
          }
          
          attempts++;
        }
        
        if (attempts >= maxAttempts) {
          console.log('Price API polling timed out');
        }
        
        // Combine hotel and price data (like listing page does)
        const result = {
          hotel: specificHotel,
          prices: { hotels: prices }
        };
        
        console.log('Combined API Response:', result); // Debug logging

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

        // Transform room data - find the specific hotel in the price API response (like listing page does)
        const hotels = result.prices?.hotels || [];
        console.log('All hotels from price API:', hotels); // Debug logging
        
        // Find the specific hotel by ID (like usePricedHotels does)
        console.log('Looking for hotelId:', hotelId);
        console.log('Hotel ID from detail API:', result.hotel.id);
        console.log('Available hotel IDs in price API:', hotels.map((hotel: any) => ({ id: hotel.id, name: hotel.name })));
        console.log('Full price API response:', result.prices);
        console.log('All hotels from price API (detailed):', hotels);
        
        // Find the specific hotel by ID - try multiple matching strategies
        let foundHotel = hotels.find((hotel: any) => 
          hotel.id === hotelId || hotel.id === result.hotel.id || 
          hotel.id?.toString() === hotelId || hotel.id?.toString() === result.hotel.id
        ) as any;
        
                  // If not found by ID, try to find by name (case insensitive)
          if (!foundHotel) {
            console.log('Hotel not found by ID, trying to find by name...');
            console.log('Looking for hotel name:', result.hotel.name);
            console.log('Available hotel names in price API:', hotels.map((hotel: any) => ({ id: hotel.id, name: hotel.name })));
            
            foundHotel = hotels.find((hotel: any) => {
              if (!hotel.name || !result.hotel.name) return false;
              const hotelName = hotel.name.toLowerCase();
              const targetName = result.hotel.name.toLowerCase();
              return hotelName.includes(targetName) || targetName.includes(hotelName);
            }) as any;
          }
        
        console.log('Specific hotel found:', foundHotel); // Debug logging
        
        let roomData: Room[] = [];
        
        if (foundHotel) {
          // Extract price from the specific hotel (like listing page does)
          let price = 0;
          let roomType = 'Standard Room';
          let freeCancellation = false;
          
          console.log('Found hotel data:', foundHotel); // Debug logging
          console.log('Found hotel price:', foundHotel.price); // Debug logging
          console.log('Found hotel lowest_price:', foundHotel.lowest_price); // Debug logging
          
          if (foundHotel.price) {
            price = Math.round(foundHotel.price as number);
          } else if (foundHotel.lowest_price) {
            price = Math.round(foundHotel.lowest_price as number);
          }
          
          roomType = foundHotel.price_type || 'Standard Room';
          freeCancellation = foundHotel.free_cancellation || false;
          
          console.log('Extracted price for hotel:', price); // Debug logging
          console.log('Room type:', roomType); // Debug logging
          
          roomData = [{
            id: foundHotel.id || hotelId,
            room_type: roomType,
            price: price,
            free_cancellation: freeCancellation,
            image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed',
            size: '35',
            description: 'Standard room with modern amenities',
            long_description: 'Comfortable room with all necessary amenities for a pleasant stay',
            amenities: ['WiFi', 'TV', 'Air Conditioning'],
            key: foundHotel.id
          }];
        }

        // If no rooms are available, try to find any hotel with pricing data
        if (roomData.length === 0) {
          console.log('No pricing data found for this hotel, checking if any hotels have pricing...');
          
          // Log some sample hotels to see what's available
          console.log('Sample hotels from price API:', hotels.slice(0, 5).map((hotel: any) => ({
            id: hotel.id,
            name: hotel.name,
            price: hotel.price,
            lowest_price: hotel.lowest_price
          })));
          
          // Find the first hotel with pricing data as a fallback
          const firstHotelWithPrice = hotels.find((hotel: any) => 
            hotel.price || hotel.lowest_price
          ) as any;
          
          if (firstHotelWithPrice) {
            console.log('Using fallback hotel with pricing:', firstHotelWithPrice);
            const fallbackPrice = Math.round((firstHotelWithPrice.price || firstHotelWithPrice.lowest_price) as number);
            
            roomData.push({
              id: firstHotelWithPrice.id,
              room_type: firstHotelWithPrice.price_type || 'Standard Room',
              price: fallbackPrice,
              free_cancellation: firstHotelWithPrice.free_cancellation || false,
              image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop',
              occupancy: parseInt(adults) + parseInt(children),
              bed_type: 'King bed',
              size: '35',
              description: `Standard room with modern amenities (pricing from ${firstHotelWithPrice.name})`,
              long_description: 'Comfortable room with all necessary amenities for a pleasant stay',
              amenities: ['WiFi', 'TV', 'Air Conditioning'],
              key: firstHotelWithPrice.id
            });
          } else {
            // If no hotels have pricing data, show that pricing is not available
            console.log('No hotels with pricing data found, showing pricing not available');
            roomData.push({
              id: hotelId,
              room_type: 'Standard Room',
              price: 0, // Indicate no pricing available
              free_cancellation: false,
              image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop',
              occupancy: parseInt(adults) + parseInt(children),
              bed_type: 'King bed',
              size: '35',
              description: 'Standard room with modern amenities',
              long_description: 'Comfortable room with all necessary amenities for a pleasant stay. Pricing information is not currently available for this hotel.',
              amenities: ['WiFi', 'TV', 'Air Conditioning'],
              key: hotelId
            });
          }
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

  console.log('Rendering HotelDetail with price:', data.rooms.length > 0 ? data.rooms[0].price : 0, 'and rooms:', data.rooms);
  
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

        {/* Main Content - Full Width Layout */}
        <div className="space-y-8 mb-12">
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

        {/* Full Width Booking Card - Below Available Rooms */}
        <div className="mb-12">
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

        {/* Location */}
        <div className="mb-12">
          <LocationMap address={data.hotel.address1} />
        </div>
      </main>
    </div>
  );
};

export default HotelDetail;
