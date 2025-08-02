import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import HotelHeader from '../components/hotel/HotelHeader';
import HotelImageGallery from '../components/hotel/HotelImageGallery';
import BookingCard from '../components/hotel/BookingCard';
import HotelInfo from '../components/hotel/HotelInfo';
import RoomOptions from '../components/hotel/RoomOptions';
import LocationMap from '../components/hotel/LocationMap';
import { Star } from 'lucide-react';

// Mock data types
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

const HotelDetail = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParam] = useSearchParams();
  const hotelId = searchParam.get('hotel_id')// Use this to fetch the id from the url and use it in the backend

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Enhanced mock data
        const mockHotel: Hotel = {
          id: hotelId || 'park-royal-singapore',
          name: 'Park Royal Collection Marina Bay',
          rating: 4.5,
          reviewCount: 2847,
          address1: '6 Raffles Boulevard, Marina Bay, Singapore 039594',
          description: 'Park Royal Collection Marina Bay offers luxury accommodation in the heart of Singapore\'s business district. Located within walking distance of Marina Bay Sands, Gardens by the Bay, and the Singapore Flyer, this contemporary hotel features elegantly appointed rooms with stunning city and bay views. Each room is equipped with modern amenities and thoughtful touches to ensure a comfortable stay for both business and leisure travelers.',
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

