import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/listing/SearchBar/SearchBar';

import styles from './pastbookingpage.module.css';

import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';

export default function PastBookingPage() {
  const navigate = useNavigate();
  
  // Basic state for the search bar (following your ListingPage pattern)
  const [userDest, setUserDest] = useState<string>('');
  const [stayDates, setStayDates] = useState<StayDatesState>({
    startDate: null,
    endDate: null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 1,
    children: 0,
    rooms: 1,
  });

  return (
    <div className={styles.container}>
      {/* Header section with search bar - similar to your ListingPage */}
      <section className={styles.searchbarSection}>
        <SearchBar
          userDest={userDest}
          setUserDest={setUserDest}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
        />
      </section>

      {/* Main content section */}
      <section className={styles.mainSection}>
        <div className={styles.mainBox}>
          {/* Past Bookings Header */}
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Past Bookings</h1>
            <p className={styles.subtitle}>View and manage your previous hotel reservations</p>
          </div>

          {/* Placeholder content area */}
          <div className={styles.contentSection}>
            <div className={styles.placeholderCard}>
              <h2>Booking history will appear here</h2>
              <p>Booking History appears here - WIP</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
