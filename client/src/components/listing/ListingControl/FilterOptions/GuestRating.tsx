import {
  FILTER_OPTIONS,
  type ListingAction,
  type ListingState,
} from '../../../../reducers/listingReducer';
import styles from './guestrating.module.css';

const RATING_TO_OPTIONTEXT = {
  0: 'Any',
  9: 'Wonderful · 9+',
  8: 'Excellent · 8+',
  7: 'Good · 7+',
  6: 'Fair · 6+',
} as const;

export default function GuestRating({
  listingState,
  listingDispatch,
}: {
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  const guestRatings = [0, 9, 8, 7, 6] as (keyof typeof RATING_TO_OPTIONTEXT)[];

  function handleSelectRating(rating: number) {
    listingDispatch({
      type: 'SET_FILTER',
      payload: { guestRating: rating },
    });
  }

  return (
    <div className={styles.container}>
      {guestRatings.map((ratingOption, i) => (
        <div
          className={styles.row}
          key={`guest-rating-row-${i}`}
          onClick={() => handleSelectRating(ratingOption)}>
          <label className={styles.inputContainer}>
            <input
              type='radio'
              name='guestRating'
              checked={
                listingState.filterBy[FILTER_OPTIONS.guestRating] ===
                ratingOption
              }
              readOnly
            />
            <span className={styles.checkmark} />
          </label>
          <span className={styles.ratingText}>
            {RATING_TO_OPTIONTEXT[ratingOption]}
          </span>
        </div>
      ))}
    </div>
  );
}
