<<<<<<< HEAD
import styles from './bookingconfirmationpage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const hotel = location.state?.hotel as (Hotel & Price) | undefined;

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!hotel) {
    return <div>No hotel selected. Please go back to the listing page.</div>;
  }

  const imageCount = hotel.imageCount;
  const prefix = hotel.image_details.prefix;
  const suffix = hotel.image_details.suffix;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };

  const imageUrl =
    imageCount > 0
      ? `${prefix}${currentIndex}${suffix}`
      : '/listing/hotel_img_placeholder.png';

  const bookingDetails = {
    hotelName: hotel.name,
    pricePerNight: hotel.price ?? 0,
    hotelAddress: hotel.address,
    hotelID: hotel.id,
  };

  return (
    <div className={styles.bookingpage}>
      <div className={styles.bookingbox}>
        <h1 className={styles.bookingtitle} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
          Booking Confirmed!
        </h1>
        <p className={styles.bookingsubtitle}>
          We are pleased to inform you that your booking is successful!
        </p>
        <hr className={styles.divider} style={{ marginBottom: '3rem' }} />

        <div className={styles.detailstitle}>Booking Details</div>

        <div className={styles.detailsgrid}>
          <div className={styles.detailitem}>
            <div className={styles.label}>Booking ID</div>
            <div className={styles.value}>{hotel.id}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Check-in Date</div>
            <div className={styles.value}>20th May 2025</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Check-out Date</div>
            <div className={styles.value}>22nd May 2025</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Total</div>
            <div className={styles.value}>${hotel.price}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Status</div>
            <div className={styles.value}>Confirmed </div>
          </div>
        </div>

        <div className={styles.roomdetail}>
          <p className={styles.label} style={{ marginBottom: '1rem', marginTop: '2.5rem' }}>Details:</p>
          <p className={`${styles.value} ${styles.bold}`}>Standard Single Room</p>
        </div>
      </div>

      <div className={styles.hotelsection}>
        <div className={styles.flexrow}>
          <div className={styles.carousel}>
            <img
              src={imageUrl}
              alt={`Hotel image ${currentIndex + 1}`}
              className={styles.hotelimage}
            />
            {imageCount > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className={styles.carouselArrow + ' ' + styles.leftArrow}
                >
                  &#8592;
                </button>
                <button
                  onClick={goNext}
                  className={styles.carouselArrow + ' ' + styles.rightArrow}
                >
                  &#8594;
                </button>
                <div className={styles.carouselIndicator}>
                  {currentIndex + 1} / {imageCount}
                </div>
              </>
            )}
          </div>

          <div className={styles.textcontent}>
            <div className={styles.hotelinfo}>
              <h2 className={styles.hotelname}>
                {hotel.name}
              </h2>
              <p className={styles.hoteladdress}>
                {hotel.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
=======
/*
export default function BookingConfirmationPage() {
  return <div>Home Page</div>;
>>>>>>> 89a53496d42b8d54ffbe68adcbd8f30dbd0ef02f
}
*/
//import React from 'react';
import './bookingconfirmationpage.css';

export default function BookingConfirmation() {
  return (
    <div className="booking-page" >
      <div className="booking-box" >
        <h1 className="booking-title" style={{ marginBottom: '1rem', marginTop: '1rem' }}>Booking Confirmed!</h1>
        <p className="booking-subtitle">
          We are pleased to inform you that your booking is successful!
        </p>
        <hr className="divider" style={{ marginBottom: '3rem' }}/>

        <div className="details-title">Booking Details</div>

        <div className="details-grid">
          <div className="detail-item">
            <div className="label">Booking ID</div>
            <div className="value">1211</div>
          </div>
          <div className="detail-item">
            <div className="label">Check-in Date</div>
            <div className="value">20th May 2025</div>
          </div>
          <div className="detail-item">
            <div className="label">Check-out Date</div>
            <div className="value">22th May 2025</div>
          </div>
          <div className="detail-item">
            <div className="label">Total</div>
            <div className="value">$622</div>
          </div>
          <div className="detail-item">
            <div className="label">Status</div>
            <div className="value confirmed">Confirmed</div>
          </div > 
        </div >

        <div className="room-detail">
          <p className="label" style={{ marginBottom: '1rem', marginTop: '2.5rem' }}>Details:</p>
          <p className="value bold"> Standard Single Room</p>
        </div >
      </div>

      <div className="hotel-section">
        <div className="flex-row">
          <img
            src="/images/hotel.png"
            alt="Hotel Room"
            className="hotel-image"
          />
          <div className="text-content">
            <div className="hotel-info">
              <h2 className="hotel-name">
                Oasia Resort Sentosa <br />
                <span className="hotel-brand">By Far East Hospitality</span>
              </h2>
              <p className="hotel-address">
                📍 23 Beach View Rd, Palawan Ridge <br />
                Sentosa Island
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
