import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import type {
  ListingAction,
  ListingState,
} from '../../../reducers/listingReducer';
import PriceRange from './FilterOptions/PriceRange/PriceRange';
import Rating from './FilterOptions/Rating';
import styles from './filterpanel.module.css';

export default function FilterPanel({
  hotels,
  listingState,
  listingDispatch,
}: {
  hotels: (Hotel & Price)[];
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.filterHeader}>
          <span>Filter by</span>
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
        <div className={styles.pricerangeSection}>
          {/* <PriceRange data={hotels.map((h) => h.price)} /> */}
          <PriceRange
            data={Array.from({ length: 100 }, () => Math.random() * 10000)}
          />
        </div>
      </div>
    </div>
  );
}
