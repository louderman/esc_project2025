import { useEffect, useState } from 'react';
import styles from './starrating.module.css';
import type {
  ListingAction,
  ListingState,
} from '../../../../reducers/listingReducer';

export default function StarRating({
  data,
  listingState,
  listingDispatch,
}: {
  data: number[];
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  const activeStars = listingState.filterBy.stars;
  const ratings = [5, 4, 3, 2, 1, 0];
  const [ratingCount, setRatingCount] = useState(Array(ratings.length).fill(0));

  useEffect(() => {
    setRatingCount(Array(ratings.length).fill(0));

    data.forEach((d) => {
      let idx = Math.floor(d);
      idx = Math.max(0, idx);
      idx = Math.min(ratingCount.length - 1, idx);

      setRatingCount((prev) => {
        const newCounts = [...prev];
        newCounts[idx]++;
        return newCounts;
      });
    });
  }, [data, ratingCount.length, ratings.length]);

  function handleSelectRating(rating: number) {
    const newStars = activeStars.includes(rating)
      ? activeStars.filter((p) => p !== rating)
      : [...activeStars, rating];

    listingDispatch({
      type: 'SET_FILTER',
      payload: {
        stars: newStars,
      },
    });
  }

  return (
    <div className={styles.container}>
      {ratings.map((rating, i) => (
        <div
          data-testid='rating-row'
          className={styles.row}
          key={`rating-row-${rating}`}
          onClick={() => handleSelectRating(rating)}
        >
          <label className={styles.inputContainer}>
            <input
              type='checkbox'
              checked={activeStars.includes(rating)}
              readOnly={true}
            />
            <span className={styles.checkmark} />
          </label>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={`rating-star-${rating}-${star}`}
                src={`/listing/stars/star_${
                  star <= rating ? 'full' : 'empty'
                }.svg`}
                alt={`${star} star`}
              />
            ))}
          </div>
          <span className={styles.ratingCount}>
            ({ratingCount[ratings.length - 1 - i]})
          </span>
        </div>
      ))}
    </div>
  );
}
