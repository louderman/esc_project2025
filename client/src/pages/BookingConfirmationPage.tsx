import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../types/Hotel';
import type { Price } from '../../../types/Price';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import styles from './bookingconfirmationpage.module.css';
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
  const bookingId = location.state?.bookingId || "N/A";

  const [currentIndex, setCurrentIndex] = useState(0);
  console.log('bookingDetails', bookingDetails);
  console.log("selectedroom", bookingDetails.selectedRoom);

  if (!hotel) {
    return <div>No hotel selected. Please go back to the listing page.</div>;
  }

  // Get hotel images - prioritize from booking details, then from hotel data, then fallback
  const getHotelImages = (): string[] => {
    // Check if images are passed through booking details
    if (bookingDetails?.hotelImages && Array.isArray(bookingDetails.hotelImages) && bookingDetails.hotelImages.length > 0) {
      return bookingDetails.hotelImages;
    }
    
    // Check if images are passed through hotel object
    if ((hotel as any)?.hotelImages && Array.isArray((hotel as any).hotelImages) && (hotel as any).hotelImages.length > 0) {
      return (hotel as any).hotelImages;
    }
    
    // Check if hotel has image_details for multiple images (backward compatibility)
    if (hotel.imageCount > 0 && hotel.image_details.prefix && hotel.image_details.suffix) {
      return Array.from({ length: Math.min(hotel.imageCount, 10) }, (_, i) => 
        `${hotel.image_details.prefix}${i}${hotel.image_details.suffix}`
      );
    }
    
    // Check for single image from hotel data
    if (hotel.image_details.prefix && hotel.image_details.prefix !== '') {
      return [hotel.image_details.prefix];
    }
    
    // Fallback to placeholder
    return ['/listing/hotel_img_placeholder.png'];
  };

  const hotelImages = getHotelImages();
  const imageCount = hotelImages.length;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };

  const imageUrl = hotelImages[currentIndex];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/listing/hotel_img_placeholder.png';
  };
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/bookings/${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch booking");
        return res.json();
      })
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) return <p>Loading booking details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!booking) return <p>No booking data found.</p>;


  //const bookingDetails = {
  //  hotelName: hotel.name,
  //  pricePerNight: hotel.price ?? 0,
  //  hotelAddress: hotel.address,
  //  hotelID: hotel.id,
  //};
  //console.log('totalAmount', booking.totalAmount);

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
              onError={handleImageError}
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
