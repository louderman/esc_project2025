import type {
  ListingAction,
  ListingState,
} from '../../../reducers/listingReducer';
import PriceRange from './FilterOptions/PriceRange/PriceRange';
import Rating from './FilterOptions/Rating';
import styles from './filterpanel.module.css';

export default function FilterPanel({
  listingState,
  listingDispatch,
}: {
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.filterHeader}>
          <span className={styles.sectionTitle}>Filter by</span>
          <button className={styles.resetButton}>
            <img src='/listing/reset.svg' /> Reset filter
          </button>
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Rating</span>
        <div className={styles.ratingSection}>
          {['Star ratings', 'Guest ratings'].map((rating, i) => (
            <div key={`rating-${i}`} className={styles.ratingSubsection}>
              <span>{rating}</span>
              <Rating groupId={i} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Price range</span>
        <PriceRange />
      </div>
    </div>
  );
}
