import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { CreateBookingRequest } from '../../../types/Booking';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import BookingForm from '../components/booking/BookingForm';
import BookingReview from '../components/booking/BookingReview';
import SelectedRoomCard from '../components/booking/SelectedRoomCard';
import { useAuth } from '../components/common/authcontext';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import styles from './bookingpage.module.css';

export default function BookingPage() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get data from navigation state - updated structure to match BookingCard
  const stateData = location.state as {
    bookingDetails?: {
      selectedRoom: any;
      numberOfGuests: {
        adults: number;
        children: number;
        total: number;
      };
      numberOfNights: number;
      numberOfRooms: number;
      checkinDate: string; // Already in YYYY-MM-DD format from BookingCard
      checkoutDate: string; // Already in YYYY-MM-DD format from BookingCard
      totalAmount: number;
      pricePerNight: number;
      hotelImage?: string;
      hotelImages?: string[]; // Array of hotel images
    };
    hotel?: {
      id: string;
      name: string;
      address?: string;
      rating: number;
      reviewCount: number;
      price: number;
      image?: string;
    };
    totalAmount?: number;
  } | undefined;

  // Check if hotel is selected - if not, show message
  if (!stateData?.hotel) {
    return (
      <main>
        <div className={styles.mainSection}>
          <div className={styles.mainBox}>
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              fontSize: '1.2rem', 
              color: '#666' 
            }}>
              No hotel selected, please return to listing page.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Use hotel data from navigation state
  const hotel: Hotel & Price = {
    // Hotel properties - use actual data from navigation state
    id: stateData.hotel.id,
    name: stateData.hotel.name,
    rating: stateData.hotel.rating,
    imageCount: 1,
    latitude: 0,
    longitude: 0,
    address: stateData.hotel.address || '',
    address1: '',
    distance: 0,
    trustyou: {
      id: '',
      score: {
        overall: 0,
        kaligo_overall: 0,
        solo: 0,
        couple: 0,
        family: 0,
        business: 0,
      },
    },
    categories: {},
    amenities_ratings: [],
    description: '',
    amenities: {},
    image_details: {
      prefix: stateData.hotel.image || '',
      count: 1,
      suffix: '',
    },
    hires_image_index: '',
    number_of_images: 1,
    default_image_index: 0,
    imgix_url: '',
    cloudflare_image_url: '',
    checkin_time: '15:00',
    // Price properties - use actual data from navigation state
    price: Math.round(stateData.hotel.price * 100) / 100,
    searchRank: 1,
    price_type: 'per_night',
    free_cancellation: true,
    rooms_available: 1,
    max_cash_payment: Math.round(stateData.hotel.price * 100) / 100,
    coverted_max_cash_payment: Math.round(stateData.hotel.price * 100) / 100,
    points: 0,
    bonuses: 0,
    bonus_programs: [],
    bonus_tiers: [],
    lowest_price: Math.round(stateData.hotel.price * 100) / 100,
    converted_price: Math.round(stateData.hotel.price * 100) / 100,
    lowest_converted_price: Math.round(stateData.hotel.price * 100) / 100,
    market_rates: [{ supplier: 'supplier-a', rate: Math.round(stateData.hotel.price * 100) / 100 }],
  };

  // Initialize states with passed booking details if available
  // Keep dates as Date objects for internal state management, but use string format for API
  const [stayDates, setStayDates] = useState<StayDatesState>(() => {
    const checkinStr = stateData?.bookingDetails?.checkinDate;
    const checkoutStr = stateData?.bookingDetails?.checkoutDate;
    
    return {
      checkinDate: checkinStr ? new Date(checkinStr + 'T00:00:00') : null, // Add time to avoid timezone issues
      checkoutDate: checkoutStr ? new Date(checkoutStr + 'T00:00:00') : null,
    };
  });
  
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: stateData?.bookingDetails?.numberOfGuests?.adults ?? 2,
    children: stateData?.bookingDetails?.numberOfGuests?.children ?? 0,
    rooms: stateData?.bookingDetails?.numberOfRooms ?? 1,
  });
  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });

  // Fetch destination data when component mounts (for consistency with other pages)
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await fetch('/api/destination/random?count=1');
        if (response.ok) {
          const destinations = await response.json();
          if (destinations && destinations.length > 0) {
            setDestination({
              id: destinations[0].dest_id,
              name: destinations[0].term,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch destination:', error);
      }
    };

    fetchDestination();
  }, []);

  // Use passed booking details for calculations - prioritize passed data
  const numberOfNights = stateData?.bookingDetails?.numberOfNights ?? (
    stayDates.checkinDate && stayDates.checkoutDate
      ? Math.ceil(
          (stayDates.checkoutDate.getTime() - stayDates.checkinDate.getTime()) /
            (1000 * 3600 * 24)
        )
      : 1
  );

  // Get hotel images - prioritize from booking details, then from hotel data, then fallback
  const getHotelImages = (): string[] => {
    // Check if images are passed through booking details (from BookingCard)
    if (stateData?.bookingDetails?.hotelImages && Array.isArray(stateData.bookingDetails.hotelImages) && stateData.bookingDetails.hotelImages.length > 0) {
      return stateData.bookingDetails.hotelImages;
    }
    
    // Check if hotel has image_details for multiple images
    if (hotel.imageCount > 0 && hotel.image_details.prefix && hotel.image_details.suffix) {
      return Array.from({ length: Math.min(hotel.imageCount, 10) }, (_, i) => 
        `${hotel.image_details.prefix}${i}${hotel.image_details.suffix}`
      );
    }
    
    // Check for single image from various sources
    const singleImage = stateData?.bookingDetails?.hotelImage || 
                       stateData?.hotel?.image || 
                       hotel.image_details.prefix;
    
    if (singleImage && singleImage !== '') {
      return [singleImage];
    }
    
    // Fallback to placeholder
    return ['/listing/hotel_img_placeholder.png'];
  };

  const hotelImages = getHotelImages();

  // Helper function to format date for display
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Helper function to format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return 'N/A';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Consolidated bookingDetails object that serves both BookingReview and PaymentForm
  const bookingDetails = {
    // Hotel information
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelAddress: [hotel.address, hotel.address1].filter(Boolean).join(', ') || 'Address not available',
    images: hotelImages,
    imageUrl: hotelImages[0], // Keep for backward compatibility with PaymentForm
    
    // Date information - formatted for display
    checkInDate: formatDateForDisplay(stayDates.checkinDate),
    checkOutDate: formatDateForDisplay(stayDates.checkoutDate),
    
    // Guest and room information
    guests: `${occupancy.rooms} room${occupancy.rooms > 1 ? 's' : ''} · ${
      occupancy.adults + occupancy.children
    } guest${occupancy.adults + occupancy.children > 1 ? 's' : ''}`,
    numberOfRooms: stateData?.bookingDetails?.numberOfRooms ?? occupancy.rooms,
    numberOfNights,
    
    // Pricing information
    pricePerNight: Math.round((stateData?.bookingDetails?.pricePerNight ?? hotel.price) * 100) / 100,
    totalAmount: stateData?.bookingDetails?.totalAmount ?? ((stateData?.bookingDetails?.pricePerNight ?? hotel.price) * numberOfNights),
    
    // User information
    userId: user ? String(user.id) : '',
    email: user ? user.email : '',
    
    // Additional booking information
    whatsIncluded: stateData?.bookingDetails?.selectedRoom?.amenities ?? Object.entries(hotel.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
    selectedRoom: stateData?.bookingDetails?.selectedRoom,
  };

  const handlePaymentSuccess = () => {
    // PaymentForm will handle navigation to confirmation page
    console.log('Payment successful - navigation handled by PaymentForm');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
  };

  // Create proper CreateBookingRequest format for PaymentForm
  const createBookingRequestData: CreateBookingRequest = {
    userId: bookingDetails.userId,
    destinationId: destination.id || undefined, // Include destination ID from search context
    hotelId: bookingDetails.hotelId,
    hotelName: bookingDetails.hotelName,
    hotelAddress: bookingDetails.hotelAddress,
    imageUrl: bookingDetails.imageUrl,
    // Use API format for dates (YYYY-MM-DD)
    checkInDate: formatDateForAPI(stayDates.checkinDate),
    checkOutDate: formatDateForAPI(stayDates.checkoutDate),
    numberOfNights: bookingDetails.numberOfNights,
    numberOfRooms: bookingDetails.numberOfRooms,
    adults: occupancy.adults,
    children: occupancy.children,
    // Ensure roomTypes is always an array
    roomTypes: bookingDetails.selectedRoom?.room_type ? [bookingDetails.selectedRoom.room_type] : 
               bookingDetails.selectedRoom?.roomType ? [bookingDetails.selectedRoom.roomType] : 
               ['Standard'],
    messageToHotel: undefined, // Will be filled by guest's special requests in PaymentForm
    // Include selectedRoom information
    selectedRoom: bookingDetails.selectedRoom ? {
      id: bookingDetails.selectedRoom.id || 'default',
      room_type: bookingDetails.selectedRoom.room_type || bookingDetails.selectedRoom.roomType || 'Standard Room',
      roomType: bookingDetails.selectedRoom.roomType || bookingDetails.selectedRoom.room_type || 'Standard Room',
      price: bookingDetails.selectedRoom.price || bookingDetails.pricePerNight,
      totalPrice: bookingDetails.selectedRoom.totalPrice || bookingDetails.totalAmount,
      free_cancellation: bookingDetails.selectedRoom.free_cancellation ?? true,
      occupancy: bookingDetails.selectedRoom.occupancy || (occupancy.adults + occupancy.children),
      bed_type: bookingDetails.selectedRoom.bed_type || 'King bed',
      size: bookingDetails.selectedRoom.size || '35',
      description: bookingDetails.selectedRoom.description || 'Standard room with modern amenities',
      amenities: bookingDetails.selectedRoom.amenities || ['WiFi', 'TV', 'Air Conditioning'],
      image: bookingDetails.selectedRoom.image
    } : undefined,
    pricePerNight: bookingDetails.pricePerNight,
    totalAmount: bookingDetails.totalAmount,
    whatsIncluded: bookingDetails.whatsIncluded,
    // Initialize proper guestInformation structure - will be filled by PaymentForm
    guestInformation: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      emailAddress: bookingDetails.email,
      specialRequests: undefined
    }
  };

  const policyDetails = {
    guaranteePolicy: 'Credit Card is required at the time of booking.',
    cancelPolicy:
      'Reservation must be cancelled by 3pm local time 1 day before arrival to avoid penalty of 1 night room and tax.',
    costPerNight: bookingDetails.pricePerNight,
    numberOfNights: bookingDetails.numberOfNights,
    bookingData: createBookingRequestData,
    selectedRoom: bookingDetails.selectedRoom,
    hotelImages: hotelImages,
    onPaymentSuccess: handlePaymentSuccess,
    onPaymentError: handlePaymentError,
  };

  return (
    <main>
      <div className={styles.mainSection}>
        <div className={styles.mainBox}>
          <BookingReview {...bookingDetails} />
          {bookingDetails.selectedRoom && (
            <SelectedRoomCard
              selectedRoom={bookingDetails.selectedRoom}
              numberOfNights={bookingDetails.numberOfNights}
              numberOfRooms={bookingDetails.numberOfRooms}
            />
          )}
          <BookingForm {...policyDetails} />
        </div>
      </div>
    </main>
  );
}
