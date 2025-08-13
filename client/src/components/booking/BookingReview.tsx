import { useState } from 'react';
import styles from './bookingreview.module.css';

// Define the props for the component based on the Figma design
interface BookingReviewProps {
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  hotelAddress: string;
  images: string[];
}

export default function BookingReview({
  hotelName,
  checkInDate,
  checkOutDate,
  guests,
  hotelAddress,
  images,
}: BookingReviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle case where no images are provided
  const displayImages = images && images.length > 0 ? images : ['/listing/hotel_img_placeholder.png'];
  const hasMultipleImages = displayImages.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/listing/hotel_img_placeholder.png';
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img 
          src={displayImages[currentImageIndex]} 
          alt={`${hotelName} - Image ${currentImageIndex + 1}`} 
          className={styles.hotelImage}
          onError={handleImageError}
        />
        
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrevious}
              className={`${styles.carouselArrow} ${styles.leftArrow}`}
              aria-label="Previous image"
            >
              &#8592;
            </button>
            <button
              onClick={goToNext}
              className={`${styles.carouselArrow} ${styles.rightArrow}`}
              aria-label="Next image"
            >
              &#8594;
            </button>
            <div className={styles.imageCounter}>
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
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
