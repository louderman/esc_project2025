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

  // Find the specific hotel we're looking for
  let specificHotel = pricedHotels.find(hotel => hotel.id === hotelId);
  
  // If hotel not found in pricedHotels, try to find it in the hotels array
  if (!specificHotel) {
    const hotelFromHotels = hotels.find(hotel => hotel.id === hotelId);
    if (hotelFromHotels) {
      console.log('Debug - Hotel found in hotels array but not in pricedHotels, creating basic hotel object');
      // Create a basic hotel object with the data from hotels array
      specificHotel = {
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
    }
  }
  
  // If hotel still not found, use the first available hotel as fallback
  if (!specificHotel && pricedHotels.length > 0) {
    console.log('Debug - Using fallback hotel:', pricedHotels[0]?.id);
    specificHotel = pricedHotels[0];
  }
  
  // If still no hotel found, try to use the first hotel from hotels array
  if (!specificHotel && hotels.length > 0) {
    console.log('Debug - Using fallback hotel from hotels array:', hotels[0]?.id);
    const fallbackHotel = hotels[0];
    specificHotel = {
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
    console.log('useEffect triggered - hotelLoading:', hotelLoading, 'priceLoading:', priceLoading, 'roomPricesLoading:', roomPricesLoading, 'specificHotel:', !!specificHotel);
    
    // Set loading to true when hooks are loading
    if (hotelLoading || priceLoading || roomPricesLoading) {
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
        
        // Wait for all data to be loaded before proceeding
        if (hotelLoading || priceLoading || roomPricesLoading) {
          console.log('Still waiting for data to load...');
          return;
        }

        // Use the hooks data instead of manual fetching
        if (!specificHotel) {
          throw new Error(`Hotel with ID ${hotelId} not found in destination ${destinationId}. Available hotels: ${hotels.length}`);
        }

        console.log('Found specific hotel with pricing:', specificHotel);
        console.log('Hotel images:', specificHotel.image_details);
        console.log('Hotel amenities:', specificHotel.amenities);
        
        // Debug room-related data
        console.log('=== ROOM DATA DEBUG ===');
        console.log('Price:', specificHotel.price);
        console.log('Lowest price:', specificHotel.lowest_price);
        console.log('Price type:', specificHotel.price_type);
        console.log('Rooms available:', specificHotel.rooms_available);
        console.log('Free cancellation:', specificHotel.free_cancellation);
        console.log('Room prices from API:', roomPrices);
        console.log('Room prices loading:', roomPricesLoading);
        console.log('Room prices length:', roomPrices?.length);
        console.log('Full specificHotel object:', JSON.stringify(specificHotel, null, 2));
        console.log('=== END ROOM DATA DEBUG ===');

        // Wait for room prices to be loaded if the hook is enabled
        if (roomPricesLoading) {
          console.log('Room prices still loading, waiting...');
          return;
        }

        // Add a 3-second delay to ensure all room data is fully loaded
        console.log('All data loaded, waiting 3 seconds for room data to fully load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('3-second delay completed, proceeding with data processing...');

        // Extract amenities from hotel description if amenities object is empty
        const extractAmenitiesFromDescription = (description: string) => {
          const amenities: Record<string, boolean> = {};
          const lowerDescription = description.toLowerCase();
          
          console.log('Extracting amenities from description:', description.substring(0, 200) + '...');
          
          // Common amenities to look for - using simpler amenity names that match the UI
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
              console.log(`Found amenity: ${keyword} -> ${amenity}`);
            }
          });
          
          console.log('Final extracted amenities:', amenities);
          return amenities;
        };

        // Transform hotel data
        const hotel: Hotel = {
          id: specificHotel.id,
          name: specificHotel.name,
          rating: specificHotel.rating,
          reviewCount: 2847, // Default value since API doesn't provide this
          address1: specificHotel.address,
          description: specificHotel.description || 'No description provided.',
          amenities: Object.keys(specificHotel.amenities || {}).length > 0 
            ? specificHotel.amenities 
            : extractAmenitiesFromDescription(specificHotel.description || ''),
          images: specificHotel.image_details && specificHotel.image_details.count > 0 ? 
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

        console.log('Transformed hotel amenities:', hotel.amenities);
        console.log('Number of amenities:', Object.keys(hotel.amenities).length);

                // Transform room data from hotel pricing information
        let roomData: Room[] = [];
        
        // Function to normalize room type names and remove duplicates
        const normalizeRoomType = (roomType: string): string => {
          if (!roomType || typeof roomType !== 'string') {
            return 'Standard Room';
          }
          // Remove common suffixes that indicate duplicates
          return roomType
            .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and their contents
            .replace(/\s*\d+$/g, '') // Remove trailing numbers
            .replace(/\s*-\s*\d+$/g, '') // Remove "- number" patterns
            .replace(/\s*\([^)]*\)$/g, '') // Remove trailing parentheses
            .trim();
        };
        
        // Function to check if two rooms are essentially the same
        const areRoomsSimilar = (room1: any, room2: any): boolean => {
          const normalizedType1 = normalizeRoomType(room1.room_normalized_description || room1.room_type || '');
          const normalizedType2 = normalizeRoomType(room2.room_normalized_description || room2.room_type || '');
          
          // Check if room types are similar (within 10% price difference and same normalized type)
          const priceDiff = Math.abs(room1.price - room2.price) / Math.max(room1.price, room2.price);
          return normalizedType1 === normalizedType2 && priceDiff < 0.1;
        };
        
        // Check if we have room prices from the API - prioritize API data over fallback
        console.log('Room prices from API:', roomPrices);
        console.log('Room prices length:', roomPrices?.length);
        console.log('Room prices loading:', roomPricesLoading);
        
        // Wait for room prices to be loaded if the hook is enabled
        if (roomPricesLoading) {
          console.log('Room prices still loading, waiting...');
          return;
        }
        
        if (roomPrices && roomPrices.length > 0) {
          console.log('Using actual room prices from API:', roomPrices.length, 'rooms');
          
          // Filter out duplicates before processing
          const uniqueRoomPrices = roomPrices.filter((roomPrice, index, array) => {
            // Check if this room is a duplicate of any previous room
            for (let i = 0; i < index; i++) {
              if (areRoomsSimilar(roomPrice, array[i])) {
                console.log('Filtering out duplicate room:', roomPrice.room_normalized_description, 'similar to:', array[i].room_normalized_description);
                return false;
              }
            }
            return true;
          });
          
          console.log('After deduplication:', uniqueRoomPrices.length, 'unique rooms');
          
          uniqueRoomPrices.forEach((roomPrice, index) => {
            console.log('Processing room:', roomPrice.room_normalized_description, 'with price:', roomPrice.price);
            
            // Extract bed type from room description
            const roomDescription = roomPrice.room_normalized_description || '';
            const bedType = roomDescription.includes('Double') ? 'Double bed' :
                           roomDescription.includes('King') ? 'King bed' :
                           roomDescription.includes('Queen') ? 'Queen bed' :
                           roomDescription.includes('Twin') ? 'Twin beds' : 'King bed';
            
            // Extract the room image URL from the images array
            let roomImageUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85'; // fallback
            
            // Try to get image from API first
            if (roomPrice.images && roomPrice.images.length > 0) {
              // Handle different image formats - could be strings or objects
              const validImage = roomPrice.images.find((img: any) => {
                if (typeof img === 'string') {
                  return img && img.trim() !== '';
                } else if (img && typeof img === 'object' && 'url' in img) {
                  return img.url && img.url.trim() !== '';
                }
                return false;
              });
              
              if (validImage) {
                // Extract URL from either string or object format
                roomImageUrl = typeof validImage === 'string' ? validImage : (validImage as any).url;
              }
            }
            
            // Use different fallback images based on room type if no valid API image
            if (roomImageUrl === 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85') {
              const roomTypeLower = roomPrice.room_normalized_description.toLowerCase();
              if (roomTypeLower.includes('deluxe') || roomTypeLower.includes('premium')) {
                roomImageUrl = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=900&fit=crop&q=85';
              } else if (roomTypeLower.includes('suite') || roomTypeLower.includes('executive')) {
                roomImageUrl = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=900&fit=crop&q=85';
              } else if (roomTypeLower.includes('standard') || roomTypeLower.includes('basic')) {
                roomImageUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85';
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
        } else if (specificHotel.price || specificHotel.lowest_price) {
          // Use the actual hotel pricing data to create detailed room options
          console.log('Using hotel pricing data to create detailed room options');
          const basePrice = Math.round((specificHotel.price || specificHotel.lowest_price) as number);
          const freeCancellation = specificHotel.free_cancellation || false;
          const roomsAvailable = specificHotel.rooms_available || 10;
          
          // Create room data from hotel pricing information
          // Since the API doesn't provide detailed room data, create realistic room options based on hotel pricing
          const roomTypes = [
            {
              type: 'Standard Room',
              price: basePrice,
              occupancy: parseInt(adults) + parseInt(children),
              bed_type: 'King bed',
              size: '35',
              description: 'Comfortable standard room with modern amenities',
              long_description: 'A well-appointed standard room featuring modern amenities, comfortable furnishings, and all the essentials for a pleasant stay.',
              amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Private Bathroom', 'Desk', 'Coffee Maker'],
              availability: Math.max(1, Math.floor(roomsAvailable * 0.6)) // 60% of rooms
            },
            {
              type: 'Deluxe Room',
              price: Math.round(basePrice * 1.2),
              occupancy: parseInt(adults) + parseInt(children),
              bed_type: 'King bed',
              size: '45',
              description: 'Spacious deluxe room with enhanced amenities',
              long_description: 'Upgraded deluxe room offering more space, enhanced amenities, and premium furnishings for an elevated stay experience.',
              amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Private Bathroom', 'Desk', 'Coffee Maker', 'Mini Bar', 'City View'],
              availability: Math.max(1, Math.floor(roomsAvailable * 0.3)) // 30% of rooms
            },
            {
              type: 'Suite',
              price: Math.round(basePrice * 1.8),
              occupancy: parseInt(adults) + parseInt(children),
              bed_type: 'King bed + Sofa bed',
              size: '65',
              description: 'Luxury suite with separate living area',
              long_description: 'Premium suite featuring a separate living area, enhanced amenities, and luxury furnishings for the ultimate comfort and convenience.',
              amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Private Bathroom', 'Living Area', 'Desk', 'Coffee Maker', 'Mini Bar', 'Balcony', 'City View'],
              availability: Math.max(1, Math.floor(roomsAvailable * 0.1)) // 10% of rooms
            }
          ];
          

          
          // Filter out duplicates from room types as well
          const uniqueRoomTypes = roomTypes.filter((roomType, index, array) => {
            // Check if this room type is a duplicate of any previous room type
            for (let i = 0; i < index; i++) {
              if (areRoomsSimilar(roomType, array[i])) {
                console.log('Filtering out duplicate room type:', roomType.type, 'similar to:', array[i].type);
                return false;
              }
            }
            return true;
          });
          
          console.log('After deduplication:', uniqueRoomTypes.length, 'unique room types');
          
          uniqueRoomTypes.forEach((roomType, index) => {
            // Use different images for different room types
            let roomImageUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85'; // default fallback
            
            if (roomType.type === 'Standard Room') {
              roomImageUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85';
            } else if (roomType.type === 'Deluxe Room') {
              roomImageUrl = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=900&fit=crop&q=85';
            } else if (roomType.type === 'Suite') {
              roomImageUrl = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=900&fit=crop&q=85';
            }
            
            roomData.push({
              id: `${specificHotel.id}-${roomType.type.toLowerCase().replace(' ', '-')}`,
              room_type: roomType.type,
              price: roomType.price,
              free_cancellation: freeCancellation,
              image: roomImageUrl,
              occupancy: roomType.occupancy,
              bed_type: roomType.bed_type,
              size: roomType.size,
              description: roomType.description,
              long_description: roomType.long_description,
              amenities: roomType.amenities,
              key: `${specificHotel.id}-${index}`,
              availability: roomType.availability // Add availability to room data
            });
          });
          
          console.log('Created', roomData.length, 'room types from hotel pricing data');
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
        const totalAvailableRooms = specificHotel.rooms_available || roomData.length;
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

        console.log('Number of room types created:', roomData.length); // Debug logging
        console.log('Total rooms available at hotel:', totalAvailableRooms); // Debug logging

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
    console.log('Checking fetch conditions - hotelLoading:', hotelLoading, 'priceLoading:', priceLoading, 'roomPricesLoading:', roomPricesLoading, 'specificHotel:', !!specificHotel);
    
    // Wait for all data to be loaded before proceeding
    if (!hotelLoading && !priceLoading && !roomPricesLoading && specificHotel) {
      console.log('All data loaded, fetching hotel data...');
      fetchHotelData();
    } else if (!hotelLoading && !priceLoading && !roomPricesLoading && !specificHotel && hotelId) {
      console.log('Hotel not found, setting error');
      setError(`Hotel with ID ${hotelId} not found`);
      setLoading(false);
    } else if (hotelLoading || priceLoading || roomPricesLoading) {
      console.log('Still loading data, keeping loading state');
      setLoading(true);
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