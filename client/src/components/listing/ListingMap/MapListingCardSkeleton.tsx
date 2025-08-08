import styles from './maplistingcardskeleton.module.css';

export default function MapListingCardSkeleton() {
  return (
    <div className={styles.container}>
      <div className={`${styles.image} ${styles.shimmer}`} />
      <div className={styles.infoSection}>
        <div className={`${styles.titleText} ${styles.shimmer}`} />
        <div className={`${styles.starsSection} ${styles.shimmer}`} />
        <div className={`${styles.userRatingBox} ${styles.shimmer}`} />
        <div className={styles.priceSection}>
          <div className={`${styles.stayInfoText} ${styles.shimmer}`} />
          <div className={`${styles.priceBox} ${styles.shimmer}`} />
        </div>
      </div>
    </div>
  );
}
