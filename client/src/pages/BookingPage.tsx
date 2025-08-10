import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import BookingForm from '../components/booking/BookingForm';
import BookingReview from '../components/booking/BookingReview';
import SelectedRoomCard from '../components/booking/SelectedRoomCard';
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
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: stateData.bookingDetails?.checkinDate ? new Date(stateData.bookingDetails.checkinDate) : null,
    checkoutDate: stateData.bookingDetails?.checkoutDate ? new Date(stateData.bookingDetails.checkoutDate) : null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: stateData.bookingDetails?.numberOfGuests?.adults ?? 2,
    children: stateData.bookingDetails?.numberOfGuests?.children ?? 0,
    rooms: stateData.bookingDetails?.numberOfRooms ?? 1,
  });
  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });

  // Use passed booking details for calculations
  const numberOfNights = stateData.bookingDetails?.numberOfNights ?? (
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
    hotelAddress: [hotel.address, hotel.address1].filter(Boolean).join(', ') || 'Address not available',
    imageUrl:
      stateData.bookingDetails?.hotelImage || 
      stateData.hotel.image || 
      (hotel.imageCount > 0
        ? `${hotel.image_details.prefix}0${hotel.image_details.suffix}`
        : '/listing/hotel_img_placeholder.png'),
  };

  const handlePaymentSuccess = () => {
    // Navigate to booking confirmation page on successful payment
    navigate('/booking/confirmation', {
      state: {
        bookingDetails,
        hotel,
        totalAmount: stateData.bookingDetails?.totalAmount ?? ((stateData.bookingDetails?.pricePerNight ?? hotel.price) * numberOfNights),
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
    costPerNight: Math.round((stateData.bookingDetails?.pricePerNight ?? hotel.price) * 100) / 100,
    numberOfNights,
    bookingData: {
      userId: user ? String(user.id) : '',
      email: user ? user.email : '',
      hotelId: hotel.id,
      hotelName: hotel.name,
      checkInDate: bookingDetails.checkInDate,
      checkOutDate: bookingDetails.checkOutDate,
      guests: bookingDetails.guests,
      pricePerNight: Math.round((stateData.bookingDetails?.pricePerNight ?? hotel.price) * 100) / 100,
      numberOfNights,
      totalAmount: stateData.bookingDetails?.totalAmount ?? ((stateData.bookingDetails?.pricePerNight ?? hotel.price) * numberOfNights),
      whatsIncluded: stateData.bookingDetails?.selectedRoom?.amenities ?? Object.entries(hotel.amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
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
          {stateData.bookingDetails?.selectedRoom && (
            <SelectedRoomCard
              selectedRoom={stateData.bookingDetails.selectedRoom}
              numberOfNights={numberOfNights}
              numberOfRooms={stateData.bookingDetails.numberOfRooms}
            />
          )}
          <BookingForm {...policyDetails} />
        </div>
      </div>
    </main>
  );
}
