import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

interface GuestInformation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  specialRequests: string;
}

interface BookingData {
  hotelAddress: string;
  checkInDate: string;
  checkOutDate: string;
  hotelId: string;
  hotelName: string;
  id: string;
  imageUrl: string;
  numberOfNights: number;
  paymentIntentId: string;
  pricePerNight: number;
  status: string;
  totalAmount: number;
  destinationId: string;
  guestInformation: GuestInformation;
  roomTypes?: string;
}

export default function BookingConfirmation() {
  const location = useLocation();
  //console.log("location.state", location.state);
  //console.log("selectedRoom", location.state?.bookingDetails?.selectedRoom?.room_type);
  //const navigate = useNavigate();

  const [hotel, setHotel] = useState<(Hotel & Price) | undefined>(location.state?.hotel);
  const [stayDates, setStayDates] = useState<StayDatesState | undefined>(location.state?.stayDates);
  const selectedRoom = location.state?.bookingDetails?.selectedRoom;
  const [room_type, setRoomType] = useState(selectedRoom?.room_type || "Standard Single Room");
  const bookingDetails = location.state?.bookingDetails || {};
  const [totalAmount, setTotalAmount] = useState<number>(location.state?.totalAmount || 0);

  const [destinationId, setDestinationId] = useState<string>(bookingDetails.destinationId || "");
  const [hotelIdBackend, setHotelIdBackend] = useState<string>(bookingDetails.hotelId || "");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [guestInfo, setGuestInfo] = useState<GuestInformation | null>(bookingDetails.guestInformation || null);
  const [hotelAddress, setHotelAddress] = useState<string>(bookingDetails.hotelAddress || hotel?.address || '');
  const [bookingId, setBookingId] = useState<string | undefined>(location.state?.bookingId);
  //const bookingId = location.state?.bookingId as string | undefined;
  const [currentIndex, setCurrentIndex] = useState(0);
  console.log('bookingDetails', bookingDetails);
  console.log("selectedroom", bookingDetails.selectedRoom);

  const [loading, setLoading] = useState(!!bookingId && !hotel);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId || hotel) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch booking details');
        return res.json();
      })
      .then((data: BookingData) => {
        console.log("Fetched booking data:", data);
        if (cancelled) return;

        setHotel({
          id: data.id,
          name: data.hotelName,
          address: data.hotelAddress || '',
          price: data.pricePerNight,
          image_details: { prefix: data.imageUrl || '', suffix: '' },
          imageCount: data.imageUrl ? 1 : 0
        } as any);

        setStayDates({
          checkinDate: data.checkInDate ? new Date(data.checkInDate) : null,
          checkoutDate: data.checkOutDate ? new Date(data.checkOutDate) : null
        });

        if (data.roomTypes) setRoomType(data.roomTypes);
        setTotalAmount(data.totalAmount);

        setDestinationId(data.destinationId);
        setHotelIdBackend(data.hotelId);
        setPaymentIntentId(data.paymentIntentId);
        setHotelAddress(data.hotelAddress  || '');
        setBookingId(data.id);
        setGuestInfo(data.guestInformation);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to fetch booking details');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [bookingId, hotel]);

  if (loading) return <p>Loading booking details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!hotel) {
    return <div>No hotel selected. Please go back to the listing page.</div>;
  }

  // Get hotel images - prioritize from booking details, then from hotel data, then fallback
  const getHotelImages = (): string[] => {
    if (bookingDetails?.hotelImages && bookingDetails.hotelImages.length > 0) {
      return bookingDetails.hotelImages;
    }

    // Check if images are passed through hotel object
    if ((hotel as any)?.hotelImages && (hotel as any).hotelImages.length > 0) {
      return (hotel as any).hotelImages;
    }

    // Check if hotel has image_details for multiple images (backward compatibility)
    if (hotel.imageCount > 0 && hotel.image_details.prefix && hotel.image_details.suffix) {
      return Array.from({ length: Math.min(hotel.imageCount, 10) },
        (_, i) => `${hotel.image_details.prefix}${i}${hotel.image_details.suffix}`
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
  const imageUrl = hotelImages[currentIndex];

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/listing/hotel_img_placeholder.png';
  };

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
        <h1 className={styles.bookingtitle}>Booking Confirmed!</h1>
        <p className={styles.bookingsubtitle}>We are pleased to inform you that your booking is successful!</p>
        <hr className={styles.divider} />

        <div className={styles.detailstitle} style={{ marginBottom: '1.5rem' }}>Booking Details</div>
        <div className={styles.roomdetail} style={{ marginBottom: '1.5rem' }}>
          <span className={styles.label}>Guest Information:</span>
          <span className={`${styles.value} ${styles.bold}`}> {guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}` : 'N/A'}</span>
        </div>        
        <div className={styles.detailsgrid}>
          <div className={styles.detailitem}>
            <div className={styles.label}>Booking ID</div>
            <div className={styles.value}>{bookingId}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Destination ID</div>
            <div className={styles.value}>{destinationId}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Hotel ID</div>
            <div className={styles.value}>{hotelIdBackend}</div>
          </div>

          <div className={styles.detailitem}>
            <div className={styles.label}>Check-in</div>
            <div className={styles.valueWhole}>{formatDate(stayDates?.checkinDate ?? null)}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Check-out</div>
            <div className={styles.valueWhole}>{formatDate(stayDates?.checkoutDate ?? null)}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Total</div>
            <div className={styles.value}>${totalAmount}</div>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.label}>Status</div>
            <div className={styles.value}>Confirmed</div>
          </div>
        </div>
        <div className={styles.roomdetail}>
          <span className={styles.label}>Room Type:</span>
          <span className={`${styles.value} ${styles.bold}`}> {room_type}</span>
        </div>
                <div className={styles.roomdetail}>
          <span className={styles.label}>Special Request:</span>
          <span className={`${styles.value} ${styles.bold}`}> {guestInfo?.specialRequests}</span>
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
              <button onClick={goPrev} className={`${styles.carouselArrow} ${styles.leftArrow}`}data-testid='leftbuttonclick'>&#8592;</button>
              <button onClick={goNext} className={`${styles.carouselArrow} ${styles.rightArrow}`}data-testid='rightbuttonclick'>&#8594;</button>
              <div className={styles.carouselIndicator}>{currentIndex + 1} / {imageCount}</div>
            </>
          )}
        </div>
        <div className={styles.textcontent}>
          <div className={styles.hotelinfo}>
            <h2 className={styles.hotelname}>{hotel.name}</h2>
            <p className={styles.hoteladdress}>{bookingDetails.hotelAddress || hotel.address || hotelAddress}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
