import PriceRange from './FilterOptions/PriceRange';
import Rating from './FilterOptions/Rating';
import styles from './filterpanel.module.css';

export default function FilterPanel() {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Filter by</span>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Rating</span>
        <div className={styles.ratingSection}>
          <Rating />
          <Rating />
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Price range</span>
        <PriceRange />
      </div>
      <div className={styles.section}>
        <button className={styles.resetButton}>Reset</button>
      </div>
    </div>
  );
}
