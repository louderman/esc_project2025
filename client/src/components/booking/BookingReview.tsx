import styles from './bookingreview.module.css';

// Define the props for the component based on the Figma design
interface BookingReviewProps {
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  hotelAddress: string;
  imageUrl: string;
}

export default function BookingReview({
  hotelName,
  checkInDate,
  checkOutDate,
  guests,
  hotelAddress,
  imageUrl,
}: BookingReviewProps) {

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={hotelName} className={styles.hotelImage} />
        <div className={styles.imageCounter}>1 / 5</div>
        <div className={styles.view360}>360°</div>
      </div>
      <div className={styles.detailsContainer}>
        <h2>REVIEW BOOKING</h2>
        <div className={styles.bookingDates}>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Check-in</span>
            <span className={styles.dateValue}>{checkInDate}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Check-out</span>
            <span className={styles.dateValue}>{checkOutDate}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Room & Guest</span>
            <span className={styles.dateValue}>{guests}</span>
          </div>
        </div>
        <h3>{hotelName}</h3>
        <div className={styles.price}>
          {hotelAddress}
        </div>
      </div>
    </div>
  );
}
