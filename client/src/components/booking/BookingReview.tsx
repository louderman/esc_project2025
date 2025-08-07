import { useState } from 'react';
import styles from './bookingreview.module.css';

// Define the props for the component based on the Figma design
interface BookingReviewProps {
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  pricePerNight: number;
  whatsIncluded: string[];
  imageUrl: string;
}

export default function BookingReview({
  hotelName,
  checkInDate,
  checkOutDate,
  guests,
  pricePerNight,
  whatsIncluded,
  imageUrl,
}: BookingReviewProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Show only first 3 amenities initially, or all if there are 3 or fewer
  const displayedAmenities = showAllAmenities ? whatsIncluded : whatsIncluded.slice(0, 3);
  const hasMoreAmenities = whatsIncluded.length > 3;

  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAllAmenities(!showAllAmenities);
  };

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
          SGD {pricePerNight} / night
        </div>
        <div className={styles.whatsIncluded}>
          <h4>WHAT'S INCLUDED</h4>
          <ul>
            {displayedAmenities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          {hasMoreAmenities && (
            <a href="#" onClick={handleViewMore}>
              {showAllAmenities ? 'VIEW LESS <' : 'VIEW MORE >'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
