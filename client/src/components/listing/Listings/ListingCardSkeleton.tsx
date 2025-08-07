import styles from './listingcardskeleton.module.css';
import parentStyles from './listingcard.module.css';

export default function ListingCardSkeleton() {
  return (
    <div
      data-testid='hotel-listing-card-skeleton'
      className={`${parentStyles.container} ${styles.container}`}
    >
      <div
        className={`${parentStyles.image} ${styles.image} ${styles.shimmer}`}
      />

      <div className={parentStyles.infoSection}>
        <div
          className={`${parentStyles.infoLeftSection} ${styles.infoLeftSection}`}
        >
          <div className={styles.infoTopLeftSection}>
            <div className={`${styles.titleText} ${styles.shimmer}`} />
            <div className={`${styles.addrText} ${styles.shimmer}`} />
            <div className={`${styles.starsSection} ${styles.shimmer}`} />
          </div>
          <div className={styles.amenitiesSection}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-amenity-${i}`} className={styles.amenity} />
            ))}
          </div>
        </div>
        <div className={styles.infoRightSection}>
          <div className={styles.priceSection}>
            <div className={`${styles.priceText} ${styles.shimmer}`} />
            <div className={`${styles.stayInfoText} ${styles.shimmer}`} />
          </div>
          <div className={`${styles.viewButton} ${styles.shimmer}`} />
        </div>
      </div>
    </div>
  );
}
