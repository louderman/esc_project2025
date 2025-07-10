import { AMENITY_KEYS, AMENITY_TO_SVG } from '../../../../constants/amenities';
import type {
  ListingAction,
  ListingState,
} from '../../../../reducers/listingReducer';
import styles from './amenities.module.css';

export default function Amenities({
  listingState,
  listingDispatch,
}: {
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  return (
    <div className={styles.container}>
      {AMENITY_KEYS.map((amenity, i) => (
        <button
          className={`${styles.amenityContainer} ${
            listingState.filterBy.amenities.includes(amenity)
              ? styles.selected
              : ''
          }`}
          onClick={() => {
            const amenities = listingState.filterBy.amenities;
            const selected = amenities.includes(amenity);

            const updatedAmenities = selected
              ? amenities.filter((a) => a !== amenity)
              : [...amenities, amenity];

            listingDispatch({
              type: 'SET_FILTER',
              payload: {
                amenities: updatedAmenities,
              },
            });
          }}
          key={`amenity-option-${i}`}
        >
          <img src={`/amenities/${AMENITY_TO_SVG[amenity]}`} />
          <span>
            {amenity
              .replace(/(tV)/g, 'tv')
              .replace(/([A-Z])/g, ' $1')
              .trim()
              .split(' ')
              .map((word) =>
                word === word.toUpperCase()
                  ? word
                  : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ')}
          </span>
        </button>
      ))}
    </div>
  );
}
