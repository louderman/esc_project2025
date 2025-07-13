import { useState } from 'react';
import BookingForm from '../components/booking/BookingForm';
import BookingReview from '../components/booking/BookingReview';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './bookingpage.module.css';

export default function BookingPage() {
  const [stayDates, setStayDates] = useState<StayDatesState>({
    startDate: null,
    endDate: null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [userDest, setUserDest] = useState('');

  const bookingDetails = {
    hotelName: 'Oasia Resort Sentosa By Far East Hospitality',
    checkInDate: '20 May',
    checkOutDate: '22 May',
    guests: '1 room, 2 guests',
    pricePerNight: 311,
    whatsIncluded: [
      'Luxurious accommodations',
      'Complimentary wireless internet access',
      'Room Service',
    ],
    imageUrl: '/listing/hotel_img_placeholder.png',
  };

  const policyDetails = {
    guaranteePolicy: 'Credit Card is required at the time of booking.',
    cancelPolicy:
      'Reservation must be cancelled by 3pm local time 1 day before arrival to avoid penalty of 1 night room and tax.',
    costPerNight: 311,
    numberOfNights: 2,
  };

  return (
    <main>
      <div className={styles.searchbarSection}>
        <SearchBar
          userDest={userDest}
          setUserDest={setUserDest}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
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
