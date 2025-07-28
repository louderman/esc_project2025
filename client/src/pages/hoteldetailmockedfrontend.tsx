import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import HotelHeader from '../components/hotel/HotelHeader';
import HotelImageGallery from '../components/hotel/HotelImageGallery';
import BookingCard from '../components/hotel/BookingCard';
import HotelInfo from '../components/hotel/HotelInfo';
import RoomOptions from '../components/hotel/RoomOptions';
import LocationMap from '../components/hotel/LocationMap';
import { Star } from 'lucide-react';
import styles from './hoteldetailpage.module.css';

// Mock data types - enhanced to match real HotelDetail.tsx
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

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get URL parameters from listing page (remove quotes from values) - optional for mock
        const destinationId = searchParams.get('destId')?.replace(/"/g, '') || 'WD0M';
        const checkin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
        const checkout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
        
        // Parse adults and children from URL (note: 'adult' and 'child' not 'adults' and 'children')
        const adults = searchParams.get('adult') || '2';
        const children = searchParams.get('child') || '0';
        const roomCount = searchParams.get('room') || '1';
        const lang = searchParams.get('lang') || 'en_US';
        const currency = searchParams.get('currency') || 'SGD';
        const countryCode = searchParams.get('country_code') || 'SG';
        
        // Calculate total guests (adults + children)
        const totalGuests = parseInt(adults) + parseInt(children);

        // Use simple guest count like ListingPage does
        const guests = totalGuests.toString();
        
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

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Enhanced mock data with realistic values
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
            restaurant: true,
            spa: true,
            businessCenter: true,
            roomService: true
          },
          images: [
            'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
          ],
          latitude: 1.2833,
          longitude: 103.8591
        };

        // Enhanced mock rooms with realistic data
        const mockRooms: Room[] = [
          {
            id: 'deluxe-room-1',
            room_type: 'Deluxe Room',
            price: 331,
            free_cancellation: true,
            image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed',
            size: '35',
            description: 'Comfortable room with modern amenities',
            long_description: 'Spacious deluxe room featuring a king-size bed, modern bathroom, and city views. Perfect for both business and leisure travelers.',
            amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Coffee Maker'],
            key: 'deluxe-room-1'
          },
          {
            id: 'premier-room-1',
            room_type: 'Premier Room',
            price: 405,
            free_cancellation: true,
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed',
            size: '42',
            description: 'Premium room with enhanced amenities',
            long_description: 'Luxurious premier room with enhanced amenities, larger space, and premium bedding. Features a separate seating area and upgraded bathroom.',
            amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Coffee Maker', 'Bathrobe', 'Slippers'],
            key: 'premier-room-1'
          },
          {
            id: 'suite-1',
            room_type: 'Executive Suite',
            price: 650,
            free_cancellation: false,
            image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=400&fit=crop',
            occupancy: parseInt(adults) + parseInt(children),
            bed_type: 'King bed + Sofa bed',
            size: '65',
            description: 'Luxury suite with separate living area',
            long_description: 'Spacious executive suite featuring a separate living room, king-size bedroom, and premium amenities. Perfect for extended stays or special occasions.',
            amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Coffee Maker', 'Bathrobe', 'Slippers', 'Separate Living Room', 'Premium Toiletries'],
            key: 'suite-1'
          }
        ];

        // Validate room availability and guest capacity
        const requestedRooms = parseInt(roomCount);
        const requestedAdults = parseInt(adults);
        const requestedChildren = parseInt(children);
        const totalRequestedGuests = totalGuests; // Use the calculated total
        
        // Calculate total available rooms and guest capacity
        const totalAvailableRooms = mockRooms.length;
        const maxGuestCapacity = mockRooms.reduce((total, room) => total + room.occupancy, 0);
        
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

        console.log('Number of rooms available:', mockRooms.length);

        setData({ 
          hotel: mockHotel, 
          rooms: mockRooms,
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
      
      {/* Main Content */}
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
        <div className="space-y-8 mb-12">
          {/* Hotel Images - Full Width */}
          <div className="w-full">
            <HotelImageGallery 
              images={data.hotel.images} 
              hotelName={data.hotel.name} 
            />
          </div>

          {/* Hotel Info - Full Width */}
          <div className="w-full">
            <HotelInfo hotel={data.hotel} />
          </div>
        </div>

        {/* Room Options */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Rooms</h2>
            <p className="text-gray-600">Choose from our selection of comfortable accommodations</p>
          </div>
          
          <div className="space-y-6">
            {data.rooms.map((room, index) => (
              <div key={room.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row">
                  {/* Room Image */}
                  <div className="lg:w-2/5 relative">
                    <img 
                      src={room.image} 
                      alt={room.room_type}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                    {room.free_cancellation && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Free Cancellation
                        </span>
                      </div>
                    )}
                    {index === 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Room Details */}
                  <div className="lg:w-3/5 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between h-full">
                      <div className="flex-1">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.room_type}</h3>
                          <p className="text-gray-600 mb-4">{room.description}</p>
                        </div>
                        
                        {/* Room Features */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Guests</p>
                              <p className="font-semibold text-gray-900">{room.occupancy} people</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bed Type</p>
                              <p className="font-semibold text-gray-900">{room.bed_type}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Size</p>
                              <p className="font-semibold text-gray-900">{room.size} m²</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Amenities</p>
                              <p className="font-semibold text-gray-900">{room.amenities?.length || 3} included</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Amenities List */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Room Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {(room.amenities || ['Free WiFi', 'Air Conditioning', 'TV']).map((amenity, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Price and Action */}
                      <div className="lg:ml-6 lg:text-right">
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-orange-400 mb-1">${room.price}</div>
                          <div className="text-sm text-gray-500 mb-2">per night</div>
                          <div className="text-xs text-gray-400">+ taxes & fees</div>
                        </div>
                        
                        <button className="w-full lg:w-auto bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-3">
                          Select Room
                        </button>
                        
                        <div className="text-xs text-gray-500">
                          <p>✓ Instant confirmation</p>
                          <p>✓ No booking fees</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Section */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Room Summary</h3>
                <p className="text-gray-600">All rooms include complimentary amenities and 24/7 support</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{data.rooms.length}</div>
                <div className="text-sm text-gray-600">room types available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Card - Horizontal Layout */}
        <div className="mb-12">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.hotel.name}</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className={i < Math.floor(data.hotel.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                      <span className="ml-2 font-medium text-gray-700">{data.hotel.rating}</span>
                    </div>
                    <span className="text-gray-600">({data.hotel.reviewCount} reviews)</span>
                  </div>
                </div>
                                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-400">${data.rooms.length > 0 ? data.rooms[0].price : 0}</div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
              </div>

              {/* Date Selection Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <button className="w-full text-left pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <span className="text-gray-900 font-medium">Oct 1, 2025</span>
                      <span className="block text-sm text-gray-500">Wednesday</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <button className="w-full text-left pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <span className="text-gray-900 font-medium">Oct 7, 2025</span>
                      <span className="block text-sm text-gray-500">Tuesday</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Guests & Rooms Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Guests & Rooms</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Adults</span>
                      <span className="font-semibold text-gray-900">{data.availability.validAdults}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Children</span>
                      <span className="font-semibold text-gray-900">{data.availability.validChildren}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Guests</span>
                      <span className="font-semibold text-gray-900">{data.availability.validAdults + data.availability.validChildren}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rooms</span>
                      <span className="font-semibold text-gray-900">{data.availability.validRoomCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Rooms Section */}
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h4 className="font-semibold text-green-800">Available Rooms</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">Rooms Available:</span>
                      <span className="font-semibold text-green-800">{data.availability.availableRooms} room{data.availability.availableRooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">Guest Capacity:</span>
                      <span className="font-semibold text-green-800">Up to {data.availability.maxGuestCapacity} guest{data.availability.maxGuestCapacity !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">Room Types:</span>
                      <span className="font-semibold text-green-800">{data.rooms.length} option{data.rooms.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">6 nights × 1 room</span>
                    <span className="font-semibold">${(data.rooms.length > 0 ? data.rooms[0].price : 0) * 6}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span className="font-semibold">${Math.round((data.rooms.length > 0 ? data.rooms[0].price : 0) * 6 * 0.1)}</span>
                  </div>
                                      <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-3">
                      <span>Total</span>
                      <span className="text-orange-400">${Math.round((data.rooms.length > 0 ? data.rooms[0].price : 0) * 6 * 1.1)}</span>
                    </div>
                </div>
              </div>

              {/* Reserve Button */}
              <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4">
                Reserve Now
              </button>

              {/* Cancellation Policy */}
              <p className="text-xs text-gray-500 text-center">
                Free cancellation until 24 hours before check-in
              </p>
            </div>
          </div>
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

