import { useEffect, useRef, useState } from 'react';
import styles from './sortpanel.module.css';
import Chevron from '../../../assets/Chevron';
import {
  SORT_OPTIONS,
  type ListingAction,
  type ListingState,
  type SortByOptions,
} from '../../../reducers/listingReducer';

const SORT_OPTION_LABELS: Record<SortByOptions, string> = {
  [SORT_OPTIONS.DEFAULT]: 'Default',
  [SORT_OPTIONS.PRICE_ASC]: 'Price (Low to High)',
  [SORT_OPTIONS.PRICE_DESC]: 'Price (High to Low)',
  [SORT_OPTIONS.RATING_ASC]: 'User rating (Low to High)',
  [SORT_OPTIONS.RATING_DESC]: 'User rating (High to Low)',
  [SORT_OPTIONS.STAR_ASC]: 'Star rating (Low to High)',
  [SORT_OPTIONS.STAR_DESC]: 'Star rating (High to Low)',
};

export default function SortPanel({
  listingState,
  listingDispatch,
}: {
  listingState: ListingState;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  const [showOptions, setShowOptions] = useState(false);

  function handleOnClick() {
    setShowOptions((prev) => !prev);
  }

  function handleOnSelectOption(sortOption: SortByOptions) {
    listingDispatch({
      type: 'SET_SORT',
      payload: sortOption,
    });
    setShowOptions(false);
  }

  const selectBoxRef = useRef<HTMLDivElement>(null);
  const itemsBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (
        !itemsBoxRef.current?.contains(ev.target as Node) &&
        !selectBoxRef.current?.contains(ev.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.selectBox}
        ref={selectBoxRef}
        onClick={handleOnClick}
      >
        <img src='/listing/sort.svg' alt='sort' />
        <div className={styles.sortByTextBox}>
          <span>Sort by: </span>
          <span className={styles.curSortOptText} data-testid='sort-select'>
            {SORT_OPTION_LABELS[listingState.sortBy]}
          </span>
        </div>
        <Chevron className={styles.chevron} />
      </div>
      {showOptions && (
        <div className={styles.itemsBox} ref={itemsBoxRef}>
          {Object.values(SORT_OPTIONS).map((sortOption, i) => (
            <div
              data-testid={`sort-option-${i}`}
              className={`${styles.item} ${
                sortOption === listingState.sortBy ? styles.selectedItem : ''
              }`}
              key={`sortByOption-${i}`}
              onClick={() => handleOnSelectOption(sortOption)}
            >
              {SORT_OPTION_LABELS[sortOption]}
              {sortOption === listingState.sortBy && (
                <div className={styles.checkmark} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
