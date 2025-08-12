import styles from './bookingconfirmationpage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
///SearchBar/DateInput/DateInput
function formatDate(date: Date | null): string {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function BookingConfirmation() {
  const location = useLocation();
  //console.log("location.state", location.state);
  //console.log("selectedRoom", location.state?.bookingDetails?.selectedRoom?.room_type);
  const navigate = useNavigate();
  const hotel = location.state?.hotel as (Hotel & Price) | undefined;
  const stayDates = location.state?.stayDates as StayDatesState | undefined;
  const selectedRoom = location.state?.bookingDetails?.selectedRoom;
  const room_type = selectedRoom?.room_type || "Standard Single Room";
  const bookingDetails = location.state?.bookingDetails || {};
  const totalAmount = location.state?.totalAmount || 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  console.log('bookingDetails', bookingDetails);
  console.log("selectedroom", bookingDetails.selectedRoom);

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

  //const bookingDetails = {
  //  hotelName: hotel.name,
  //  pricePerNight: hotel.price ?? 0,
  //  hotelAddress: hotel.address,
  //  hotelID: hotel.id,
  //};

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
            <div className={styles.value}>{formatDate(stayDates?.checkinDate ?? null)}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Check-out Date</div>
            <div className={styles.value}>{formatDate(stayDates?.checkoutDate ?? null)}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Total</div>
            <div className={styles.value}>${totalAmount}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Status</div>
            <div className={styles.value}>Confirmed </div>
          </div>
        </div>

        <div className={styles.roomdetail}>
          <p className={styles.label} style={{ marginBottom: '1rem', marginTop: '2.5rem' }}>Details:</p>
          <p className={`${styles.value} ${styles.bold}`}>{room_type}</p>
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
}
