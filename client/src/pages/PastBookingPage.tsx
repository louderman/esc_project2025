import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/listing/SearchBar/SearchBar';

import styles from './pastbookingpage.module.css';

import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';

export default function PastBookingPage() {
  const navigate = useNavigate();
  
  const [userDest, setUserDest] = useState<string>('');
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

const bookings = {
  //Put static details here currently
  id: 1211,
  hotel_name: "Oasia Resort Sentosa By Far East Hospitality",
    hotel_address: "23 Beach View Rd, Palawan Ridge, Sentosa Island",
    check_in: "20th May 2025",
    check_out: "22nd May 2025",
    status: "Confirmed",
    image_url: '/listing/hotel_img_placeholder.png',
};

  return (
    <div className={styles.container}>
      <section className={styles.searchbarSection}>
        <SearchBar
          destination={destination}
          setDestination={setDestination}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
          onSubmit={() => {}}
        />
      </section>

      {/* Main content section */}
      <section className={styles.mainSection}>
        <div className={styles.mainBox}>
          {/* Past Bookings Card */}
          <div className={styles.titleCard}>
            <h1 className={styles.pageTitle}>Past Bookings</h1>
            <p className={styles.subtitle}>View and manage your previous hotel reservations</p>
          </div>

<div className={styles.cardsContainer}>
            {/* Past Booking Hotel Card */}
            <div className={styles.bookingCard}>
              <img
                className={styles.bookingImg}
                src={bookings.image_url}
                alt={bookings.hotel_name}
              />
              <div className={styles.cardRight}>
                <div className={styles.hotelName}>{bookings.hotel_name}</div>
                <div className={styles.hotelAddress}>
                  <span className={styles.icon}>📍</span> {bookings.hotel_address}
                </div>
                <div className={styles.detailsCol}>
                  <div>
                    <span className={styles.detailsLabel}>Booking ID</span> {bookings.id}
                  </div>
                  <div>
                    <span className={styles.detailsLabel}>Check-in Date</span> {bookings.check_in}
                  </div>
                  <div>
                    <span className={styles.detailsLabel}>Check-out Date</span> {bookings.check_out}
                  </div>
                  <div>
                    <span className={styles.detailsLabel}>Status</span>
                    <span className={styles.statusConfirmed}>{bookings.status}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* End Past Booking Card */}
          </div>
        </div>
      </section>
    </div>
  );
}
