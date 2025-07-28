import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './pastbookingpage.module.css';

export default function PastBookingPage() {
  const navigate = useNavigate();
  

const bookings = {
  //Put static details here currently
  id: 1211,
  hotel_name: "Oasia Resort Sentosa By Far East Hospitality",
    hotel_address: "23 Beach View Rd, Palawan Ridge, Sentosa Island",
    check_in: "28th July 2025",
    check_out: "30th July 2025",
    status: "Confirmed",
    //image_url: '/listing/hotel_img_placeholder.png
    imageCount: 0, 
    image_details: {
      prefix: '/listing/hotel_img_placeholder.png?id=',
      suffix: '',
    },
  };

  const handleCardClick = () => {
    navigate('/booking/confirmation');
  };

  return (
    <div className={styles.container}>

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
            <div className={styles.bookingCard}
            onClick={handleCardClick}
              style={{ cursor: 'pointer' }} 
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
              role="button"
              aria-label={`View details for booking at ${bookings.hotel_name}`}
            >
              <img
  className={styles.bookingImg}
  src={
    bookings.imageCount > 0
      ? `${bookings.image_details.prefix}0${bookings.image_details.suffix}`
      : '/listing/hotel_img_placeholder.png'
  }
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
