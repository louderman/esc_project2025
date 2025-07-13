// import { useMemo } from 'react';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import {
  initialListingState,
  type ListingAction,
  type ListingState,
} from '../../../reducers/listingReducer';
import Amenities from './FilterOptions/Amenities';
import PriceRange from './FilterOptions/PriceRange/PriceRange';
import StarRating from './FilterOptions/StarRating';
import styles from './filterpanel.module.css';
import { useFilteredHotels } from '../../../hooks/hotels/useFilteredHotels';
import GuestRating from './FilterOptions/GuestRating';

export default function FilterPanel({
  hotels,
  listingState,
  listingDispatch,
}: {
  hotels: (Hotel & Price)[];
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  // const testData = useMemo(() => {
  //   return Array.from(
  //     { length: 100 },
  //     () => Math.round(Math.random() * 1000000) / 100
  //   );
  // }, []);

  function onResetFilters() {
    listingDispatch({
      type: 'RESET_FILTERS',
    });
  }

  /**
   * Filter hotel with all options EXCEPT price, so that
   * the price range barchart can show the real-time amount of filtered hotels.
   *
   * The rangeBoundary is the min and max price of all unfiltered hotels.
   * This is used to clamp user input to valid min and max price values.
   */
  const hotelsFilteredWithoutPrice = useFilteredHotels(hotels, {
    ...listingState.filterBy,
    priceRange: initialListingState.filterBy.priceRange,
  });

  const prices = hotels.map((h) => h.price);
  const rangeBoundary: [number, number] = prices.length
    ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
    : initialListingState.filterBy.priceRange;

  /**
   * Filter hotel with all options EXCEPT ratings
   */
  const hotelsFilteredWithoutRating = useFilteredHotels(hotels, {
    ...listingState.filterBy,
    stars: initialListingState.filterBy.stars,
  });

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.filterHeader}>
          <span>Filter by</span>
          <button className={styles.resetButton} onClick={onResetFilters}>
            <img src='/listing/reset.svg' /> Reset filter
          </button>
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Rating</span>
        <div className={styles.ratingSection}>
          <div className={styles.ratingSubsection}>
            <span>Star ratings</span>
            <StarRating
              data={hotelsFilteredWithoutRating.map((h) => h.rating)}
              listingState={listingState}
              listingDispatch={listingDispatch}
            />
          </div>
          <div className={styles.ratingSubsection}>
            <span>Guest ratings</span>
            <GuestRating
              listingState={listingState}
              listingDispatch={listingDispatch}
            />
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Price range</span>
        <div className={styles.pricerangeSection}>
          <PriceRange
            listingState={listingState}
            listingDispatch={listingDispatch}
            rangeBoundary={rangeBoundary}
            data={hotelsFilteredWithoutPrice.map(
              (h) => Math.round(h.price * 100) / 100
            )}
          />
          {/* <PriceRange
            listingState={listingState}
            listingDispatch={listingDispatch}
            data={testData}
          /> */}
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Amenities</span>
        <Amenities
          listingState={listingState}
          listingDispatch={listingDispatch}
        />
      </div>
    </div>
  );
}
