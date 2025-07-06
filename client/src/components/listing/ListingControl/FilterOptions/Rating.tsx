import { useState } from 'react';
import styles from './rating.module.css';

export default function Rating({ groupId }: { groupId: number | string }) {
  const [activeRatings, setActiveRatings] = useState<number[]>([]);
  const ratings = [5, 4, 3, 2, 1];

  function selectRating(rating: number) {
    setActiveRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((p) => p !== rating)
        : [...prev, rating]
    );
  }

  return (
    <div className={styles.container}>
      {ratings.map((rating) => (
        <div
          className={styles.row}
          key={`group-${groupId}row-${rating}`}
          onClick={() => selectRating(rating)}>
          <label className={styles.inputContainer}>
            <input
              type='checkbox'
              checked={activeRatings.includes(rating)}
              readOnly={true}
            />
            <span className={styles.checkmark} />
          </label>
          <div className={styles.stars}>
            {[...ratings].reverse().map((star) => (
              <img
                key={`group-${groupId}-star-${rating}-${star}`}
                src={`/listing/stars/star_${
                  star <= rating ? 'full' : 'empty'
                }.svg`}
                alt={`${star} star`}
              />
            ))}
          </div>
          <span className={styles.ratingCount}>(11)</span>
        </div>
      ))}
    </div>
  );
}
