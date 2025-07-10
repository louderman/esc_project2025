import { useEffect, useState } from 'react';
import styles from './pricerange.module.css';
import Slider from './Slider';
import {
  initialListingState,
  type ListingAction,
  type ListingState,
} from '../../../../../reducers/listingReducer';

export default function PriceRange({
  data,
  rangeBoundary,
  listingState,
  listingDispatch,
}: {
  data: number[];
  rangeBoundary: [number, number];
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  /** TODO:
    1. Fix cursor jumping to the end when invalid char / , is inserted.
  */

  // console.log(data);
  // console.log(rangeBoundary);

  const [filterMin, filterMax] = listingState.filterBy.priceRange;
  const [rangeMin, rangeMax] = rangeBoundary;
  const [priceRange, setPriceRange] = useState<[number, number]>(
    listingState.filterBy.priceRange
  );
  const [lastValidRange, setLastValidRange] = useState<[number, number]>(
    listingState.filterBy.priceRange
  );

  /**
   * Syncs the price range state with the URL and available data boundaries.
   *
   * This effect runs when either the `listingState.filterBy.priceRange` or the computed `rangeBoundary` changes.
   *
   * Logic:
   * 1. If the selected price range is within the valid data range, update local state (`priceRange`) accordingly.
   * 2. If it's outside the bounds, clamp it to the nearest valid range:
   *    - If the current priceRange isn't the default, update the global state via `listingDispatch`.
   *    - Always update local state (`priceRange`) with the clamped range.
   * 3. Save the latest valid boundary to `lastValidRange` for use in validation elsewhere.
   *
   * Notes:
   * - We extract `rangeMin`, `rangeMax`, `filterMin`, and `filterMax` directly so we can avoid using `rangeBoundary` as a dependency,
   *   which would otherwise create a new array reference on each render and cause an infinite re-render loop.
   */
  useEffect(() => {
    const inRange = filterMin >= rangeMin && filterMax <= rangeMax;
    setLastValidRange(rangeBoundary);

    if (inRange) {
      setPriceRange(listingState.filterBy.priceRange);
    } else {
      const clampedMin = Math.max(Math.min(filterMin, rangeMax), rangeMin);
      const clampedMax = Math.min(filterMax, rangeMax);

      const isNotInitial =
        filterMin !== initialListingState.filterBy.priceRange[0] ||
        filterMax !== initialListingState.filterBy.priceRange[1];

      if (isNotInitial) {
        listingDispatch({
          type: 'SET_FILTER',
          payload: {
            priceRange: [clampedMin, clampedMax],
          },
        });
      }

      setPriceRange([clampedMin, clampedMax]);
    }
  }, [rangeMin, rangeMax, filterMin, filterMax]);

  function handleChangePrice(ev: React.ChangeEvent<HTMLInputElement>) {
    const name = ev.currentTarget.name;
    const input = ev.currentTarget;
    // TODO: Fix cursor problem in input element
    const cursorPos = input.selectionStart ?? 0;

    let value = parseFloat(ev.currentTarget.value.replace(/[^0-9.]/g, ''));
    value = Math.floor(value * 100) / 100;
    console.log(value);
    if (isNaN(value)) value = 0;

    setPriceRange((prev) => {
      const newRange: [number, number] =
        name === 'min' ? [value, prev[1]] : [prev[0], value];
      if (
        Math.abs(newRange[0] - prev[0]) < 0.001 &&
        Math.abs(newRange[1] - prev[1]) < 0.001
      ) {
        return prev;
      }

      return newRange;
    });
  }

  function handleSetPrice() {
    if (
      priceRange[0] > priceRange[1] ||
      priceRange[0] < rangeMin ||
      priceRange[1] > rangeMax
    ) {
      setPriceRange(lastValidRange);
    } else {
      listingDispatch({
        type: 'SET_FILTER',
        payload: {
          priceRange: priceRange,
        },
      });
      setLastValidRange(priceRange);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sliderSection}>
        <Slider
          data={data}
          selectedRange={priceRange}
          setSelectedRange={setPriceRange}
          onBlur={handleSetPrice}
        />
      </div>
      <div className={styles.inputboxSection}>
        <label className={styles.inputbox}>
          <span>Min price</span>
          <div className={styles.inputGroup}>
            <span>$</span>
            <input
              type='text'
              name='min'
              onChange={handleChangePrice}
              onBlur={handleSetPrice}
              value={priceRange[0].toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            />
          </div>
        </label>
        <label className={styles.inputbox}>
          <span>Max price</span>
          <div className={styles.inputGroup}>
            <span>$</span>
            <input
              type='text'
              name='max'
              onChange={handleChangePrice}
              onBlur={handleSetPrice}
              value={priceRange[1].toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            />
          </div>
        </label>
      </div>
    </div>
  );
}
