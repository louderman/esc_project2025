import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import BookingForm from '../components/booking/BookingForm';
import BookingReview from '../components/booking/BookingReview';
import { useAuth } from '../components/common/authcontext';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './bookingpage.module.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get data from navigation state
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
      checkinDate: string;
      checkoutDate: string;
      totalAmount: number;
      pricePerNight: number;
      hotelImage?: string;
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

  // Use state data if available, otherwise fall back to mock data
  const hotel: Hotel & Price = stateData?.hotel ? {
    // Hotel properties - use actual data from navigation state
    id: stateData.hotel.id || 'mock-oasia-1',
    name: stateData.hotel.name || 'Oasia Resort Sentosa By Far East Hospitality',
    rating: stateData.hotel.rating || 4.5,
    imageCount: 5,
    latitude: 1.2588,
    longitude: 103.823,
    address: stateData.hotel.address || '23 Beach View, Sentosa Island',
    address1: 'Singapore, 098679',
    distance: 5.4,
    trustyou: {
      id: 'ty-1',
      score: {
        overall: 9,
        kaligo_overall: 9,
        solo: 8,
        couple: 9,
        family: 9,
        business: 8,
      },
    },
    categories: {},
    amenities_ratings: [],
    description:
      'A luxurious resort on Sentosa island, perfect for a relaxing getaway.',
    amenities: { outdoorPool: true, roomService: true },
    image_details: {
      prefix: stateData.hotel.image || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85',
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
    price: Math.round((stateData.hotel.price || 311) * 100) / 100,
    searchRank: 1,
    price_type: 'per_night',
    free_cancellation: true,
    rooms_available: 5,
    max_cash_payment: Math.round((stateData.hotel.price || 311) * 100) / 100,
    coverted_max_cash_payment: Math.round((stateData.hotel.price || 311) * 100) / 100,
    points: 5000,
    bonuses: 0,
    bonus_programs: [],
    bonus_tiers: [],
    lowest_price: Math.round((stateData.hotel.price || 311) * 100) / 100,
    converted_price: Math.round((stateData.hotel.price || 311) * 100) / 100,
    lowest_converted_price: Math.round((stateData.hotel.price || 311) * 100) / 100,
    market_rates: [{ supplier: 'supplier-a', rate: Math.round((stateData.hotel.price || 320) * 100) / 100 }],
  } : {
    // Hotel properties - fallback mock data
    id: 'mock-oasia-1',
    name: 'Oasia Resort Sentosa By Far East Hospitality',
    rating: 4.5,
    imageCount: 5,
    latitude: 1.2588,
    longitude: 103.823,
    address: '23 Beach View, Sentosa Island',
    address1: 'Singapore, 098679',
    distance: 5.4,
    trustyou: {
      id: 'ty-1',
      score: {
        overall: 9,
        kaligo_overall: 9,
        solo: 8,
        couple: 9,
        family: 9,
        business: 8,
      },
    },
    categories: {},
    amenities_ratings: [],
    description:
      'A luxurious resort on Sentosa island, perfect for a relaxing getaway.',
    amenities: { outdoorPool: true, roomService: true },
    image_details: {
      prefix: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85',
      count: 1,
      suffix: '',
    },
    hires_image_index: '',
    number_of_images: 1,
    default_image_index: 0,
    imgix_url: '',
    cloudflare_image_url: '',
    checkin_time: '15:00',
    // Price properties
    price: 311,
    searchRank: 1,
    price_type: 'per_night',
    free_cancellation: true,
    rooms_available: 5,
    max_cash_payment: 311,
    coverted_max_cash_payment: 311,
    points: 5000,
    bonuses: 0,
    bonus_programs: [],
    bonus_tiers: [],
    lowest_price: 311,
    converted_price: 311,
    lowest_converted_price: 311,
    market_rates: [{ supplier: 'supplier-a', rate: 320 }],
  };

  // Initialize states with passed booking details if available
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: stateData?.bookingDetails?.checkinDate ? new Date(stateData.bookingDetails.checkinDate) : null,
    checkoutDate: stateData?.bookingDetails?.checkoutDate ? new Date(stateData.bookingDetails.checkoutDate) : null,
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

  // Use passed booking details for calculations
  const numberOfNights = stateData?.bookingDetails?.numberOfNights ?? (
    stayDates.checkinDate && stayDates.checkoutDate
      ? Math.ceil(
          (stayDates.checkoutDate.getTime() - stayDates.checkinDate.getTime()) /
            (1000 * 3600 * 24)
        )
      : 1
  );

  const bookingDetails = {
    hotelName: hotel.name,
    checkInDate: stayDates.checkinDate
      ? stayDates.checkinDate.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
        })
      : 'N/A',
    checkOutDate: stayDates.checkoutDate
      ? stayDates.checkoutDate.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
        })
      : 'N/A',
    guests: `${occupancy.rooms} room${occupancy.rooms > 1 ? 's' : ''} · ${
      occupancy.adults + occupancy.children
    } guest${occupancy.adults + occupancy.children > 1 ? 's' : ''}`,
    pricePerNight: Math.round((stateData?.bookingDetails?.pricePerNight ?? hotel.price ?? 0) * 100) / 100,
    whatsIncluded: stateData?.bookingDetails?.selectedRoom?.amenities ?? Object.entries(hotel.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
    imageUrl:
      stateData?.bookingDetails?.hotelImage || 
      stateData?.hotel?.image || 
      (hotel.imageCount > 0
        ? `${hotel.image_details.prefix}0${hotel.image_details.suffix}`
        : 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85'),
  };

  const handlePaymentSuccess = () => {
    // Navigate to booking confirmation page on successful payment
    navigate('/booking/confirmation', {
      state: {
        bookingDetails,
        hotel,
        totalAmount: stateData?.bookingDetails?.totalAmount ?? ((stateData?.bookingDetails?.pricePerNight ?? hotel.price ?? 0) * numberOfNights),
      },
    });
  };

  const handlePaymentError = (error: string) => {
    // Console error for now
    // TODO: add a toast saying it failed, ya lazy bum
    console.error('Payment failed:', error);
  };

  const policyDetails = {
    guaranteePolicy: 'Credit Card is required at the time of booking.',
    cancelPolicy:
      'Reservation must be cancelled by 3pm local time 1 day before arrival to avoid penalty of 1 night room and tax.',
    costPerNight: Math.round((stateData?.bookingDetails?.pricePerNight ?? hotel.price ?? 0) * 100) / 100,
    numberOfNights,
    bookingData: {
      userId: user ? String(user.id) : '',
      email: user ? user.email : '',
      hotelId: hotel.id,
      hotelName: hotel.name,
      checkInDate: bookingDetails.checkInDate,
      checkOutDate: bookingDetails.checkOutDate,
      guests: bookingDetails.guests,
      pricePerNight: Math.round((stateData?.bookingDetails?.pricePerNight ?? hotel.price ?? 0) * 100) / 100,
      numberOfNights,
      totalAmount: stateData?.bookingDetails?.totalAmount ?? ((stateData?.bookingDetails?.pricePerNight ?? hotel.price ?? 0) * numberOfNights),
      whatsIncluded: bookingDetails.whatsIncluded,
      imageUrl: bookingDetails.imageUrl,
      bookingAddress: [hotel.address, hotel.address1].filter(Boolean).join(', '),
    },
    onPaymentSuccess: handlePaymentSuccess,
    onPaymentError: handlePaymentError,
  };

  return (
    <main>
      <div className={styles.searchbarSection}>
        <SearchBar
          destination={destination}
          setDestination={setDestination}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
          onSubmit={() => {}} // to be completed. Why is searchbar needed here?
        />
      </div>
      <div className={styles.mainSection}>
        <div className={styles.mainBox}>
          <BookingReview {...bookingDetails} />
          <BookingForm {...policyDetails} />
        </div>
      </div>
    </main>
  );
}
