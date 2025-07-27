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

type ApiResponse = {
  hotel: Hotel;
  rooms: Room[];
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

        // Get URL parameters
        const destinationId = searchParams.get('destination_id') || 'WD0M';
        const checkin = searchParams.get('checkin') || '2025-10-01';
        const checkout = searchParams.get('checkout') || '2025-10-07';
        const adults = searchParams.get('adults') || '2';
        const children = searchParams.get('children') || '0';
        const roomCount = searchParams.get('rooms') || '1';
        const lang = searchParams.get('lang') || 'en_US';
        const currency = searchParams.get('currency') || 'SGD';
        const countryCode = searchParams.get('country_code') || 'SG';

        // Build guests string for API
        const guests = Array(parseInt(roomCount)).fill(parseInt(adults)).join('|');

        // Fetch combined hotel data
        const response = await fetch(`/api/hotel-detail/combined/${hotelId}?${new URLSearchParams({
          destination_id: destinationId,
          checkin,
          checkout,
          guests,
          lang,
          currency,
          country_code: countryCode,
          partner_id: '1'
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
        const roomData: Room[] = result.prices.rooms?.map((room: any, index: number) => ({
          id: room.key || `room-${index}`,
          room_type: room.room_normalized_description || 'Room',
          price: Math.round(room.price) || 0,
          free_cancellation: room.free_cancellation || false,
          image: room.images?.[0] || `https://images.unsplash.com/photo-${['1649972904349-6e44c42644a7', '1581091226825-a6a2a5aee158', '1721322800607-8c38375eef04'][index % 3]}?w=600&h=400&fit=crop`,
          occupancy: parseInt(adults) + parseInt(children),
          bed_type: 'King bed', // Default value
          size: '35', // Default value
          description: room.description,
          long_description: room.long_description,
          amenities: room.amenities,
          key: room.key
        })) || [];

        setData({ hotel, rooms: roomData });
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
              price={data.rooms[0]?.price || 331}
              rating={data.hotel.rating}
              reviewCount={data.hotel.reviewCount}
              hotelName={data.hotel.name}
              hotelId={hotelId}
            />
          </div>
        </div>

        {/* Room Options */}
        <div className="mb-12">
          <RoomOptions rooms={data.rooms} />
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
