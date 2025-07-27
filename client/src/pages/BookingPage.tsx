import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import BookingForm from '../components/booking/BookingForm';
import BookingReview from '../components/booking/BookingReview';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import styles from './bookingpage.module.css';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import { useSearchBarUrlSync } from '../hooks/url/useSearchBarUrlSync';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hotel = location.state?.hotel as (Hotel & Price) | undefined;

  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: null,
    checkoutDate: null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });

  if (!hotel) {
    return <div>No hotel selected. Please go back to the listing page.</div>;
  }

  const numberOfNights =
    stayDates.checkinDate && stayDates.checkoutDate
      ? Math.ceil(
          (stayDates.checkoutDate.getTime() - stayDates.checkinDate.getTime()) /
            (1000 * 3600 * 24)
        )
      : 1;

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
    guests: `${occupancy.rooms} room${occupancy.rooms > 1 ? 's' : ''}, ${
      occupancy.adults + occupancy.children
    } guest${occupancy.adults + occupancy.children > 1 ? 's' : ''}`,
    pricePerNight: hotel.price ?? 0,
    whatsIncluded: Object.entries(hotel.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
    imageUrl:
      hotel.imageCount > 0
        ? `${hotel.image_details.prefix}0${hotel.image_details.suffix}`
        : '/listing/hotel_img_placeholder.png',
  };

  const policyDetails = {
    guaranteePolicy: 'Credit Card is required at the time of booking.',
    cancelPolicy:
      'Reservation must be cancelled by 3pm local time 1 day before arrival to avoid penalty of 1 night room and tax.',
    costPerNight: hotel.price ?? 0,
    numberOfNights,
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
