import GoogleMap from './GoogleMap';
import styles from './listingmap.module.css';
import FilterPanel from '../ListingControl/FilterPanel';
import type { Price } from '../../../../../types/Price';
import type { Hotel } from '../../../../../types/Hotel';
import type {
  ListingAction,
  ListingState,
} from '../../../reducers/listingReducer';
import MapListingCard from './MapListingCard';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import MapListingCardSkeleton from './MapListingCardSkeleton';

export default function ListingMap({
  hotels,
  sortedHotels, // TODO: remove this?
  stayDates,
  occupancy,
  loading,
  listingState,
  listingDispatch,
}: {
  hotels: (Hotel & Price)[];
  sortedHotels: (Hotel & Price)[];
  stayDates: StayDatesState;
  occupancy: OccupancyState;
  loading: boolean;
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  // TODO: disable bg scrolling if possible

  return (
    <div className={styles.container}>
      <div className={styles.sidebarSection}>
        <div className={styles.filterSection}>
          <FilterPanel
            hotels={hotels}
            listingDispatch={listingDispatch}
            listingState={listingState}
          />
        </div>
        <div className={styles.listingSection}>
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <MapListingCardSkeleton key={`skeleton-${i}`} />
            ))}
          {!loading &&
            sortedHotels
              .slice(0, 10)
              .map((hotel) => (
                <MapListingCard
                  hotel={hotel}
                  occupancy={occupancy}
                  stayDates={stayDates}
                  loading={loading}
                  key={`map-listing-card-${hotel.id}`}
                />
              ))}
        </div>
      </div>
      <div className={styles.mapSection}>
        <GoogleMap />
      </div>
    </div>
  );
}
