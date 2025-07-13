import { useState } from 'react';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import BookingForm from '../components/booking/BookingForm';
import BookingReview from '../components/booking/BookingReview';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './bookingpage.module.css';

export default function BookingPage() {
  const hotel: Hotel & Partial<Price> = {
    id: '27225324',
    name: 'Oasia Resort Sentosa by Far East Hospitality',
    rating: 5,
    imageCount: 5,
    image_details: {
      prefix:
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542957392.jpg?k=603585ae63a1f285412e0d9dca035c581aceadc3408cf28a2c2eb3c7ba75f0a2&o=',
      suffix: '.jpg',
      count: 5,
    },
    address: '23 Beach View, Palawan Ridge, Sentosa Island, 098679, Singapore',
    latitude: 1.25481,
    longitude: 103.8239,
    address1: '23 Beach View, Palawan Ridge',
    distance: 0,
    trustyou: {
      id: 'test',
      score: {
        overall: 88,
        kaligo_overall: 88,
        solo: null,
        couple: null,
        family: null,
        business: null,
      },
    },
    amenities_ratings: [],
    description: 'test description',
    hires_image_index: '',
    number_of_images: 5,
    default_image_index: 0,
    imgix_url: '',
    cloudflare_image_url: '',
    checkin_time: '15:00',
    amenities: {
      airConditioning: true,
      businessCenter: true,
      inHouseDining: true,
      parkingGarage: true,
      clothingIron: true,
      kitchen: true,
      inHouseBar: true,
      outdoorPool: true,
      roomService: true,
      sauna: true,
      tVInRoom: true,
    },
    categories: {
      overall: {
        score: 88,
        name: 'overall',
        popularity: 100,
      },
    },
    price: 311,
  };

  const [stayDates, setStayDates] = useState<StayDatesState>({
    startDate: new Date('2024-05-20'),
    endDate: new Date('2024-05-22'),
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [userDest, setUserDest] = useState('');

  const numberOfNights = stayDates.startDate && stayDates.endDate
    ? Math.ceil((stayDates.endDate.getTime() - stayDates.startDate.getTime()) / (1000 * 3600 * 24))
    : 1;

  const bookingDetails = {
    hotelName: hotel.name,
    checkInDate: stayDates.startDate ? stayDates.startDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : 'N/A',
    checkOutDate: stayDates.endDate ? stayDates.endDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : 'N/A',
    guests: `${occupancy.rooms} room${occupancy.rooms > 1 ? 's' : ''}, ${occupancy.adults + occupancy.children} guest${occupancy.adults + occupancy.children > 1 ? 's' : ''}`,
    pricePerNight: hotel.price ?? 0,
    whatsIncluded: Object.entries(hotel.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
    imageUrl: hotel.imageCount > 0 
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
