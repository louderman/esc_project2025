import { useMemo, useState } from 'react';
import inputStyles from './inputbox.module.css';
import styles from './destinationinput.module.css';
import { type Destination } from '../../../../../types/Destination';

// TODO: replace onMouseDown

export default function DestinationInput() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dests: Destination[] = useMemo(
    () => [
      {
        term: 't',
        lat: 1.1,
        lng: 1.1,
        type: 'city',
        uid: 'uid1',
        state: 'Singapore, Singapore',
      },
      {
        term: 't2',
        lat: 1.1,
        lng: 1.1,
        type: 'airport',
        uid: 'uid2',
        state: 'Malaysia, Johor Bahru',
      },
    ],
    []
  );
  const [suggestedDests, setSuggestedDests] = useState<Destination[]>(dests);
  const [userDest, setUserDest] = useState<string>('');

  function handleOnFocus() {
    setShowSuggestions(true);
  }

  function handleOnBlur() {
    setShowSuggestions(false);
  }

  return (
    <div className={inputStyles.inputWrapper}>
      <img src='/listing/destination_red.svg' />
      <input
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        className={inputStyles.inputBox}
        type='text'
        placeholder='Destination'
        value={userDest}
        onChange={(e) => setUserDest(e.target.value)}
      />
      {showSuggestions && (
        <ul className={styles.suggestionContainer}>
          {suggestedDests.map((dest, i) => (
            <li
              key={`dest-${i}`}
              onMouseDown={() => setUserDest(dest.state)}
              className={styles.suggestionItem}
            >
              <img src='/listing/destination_gray.svg' />
              <div className={styles.itemTextSection}>
                <span className={styles.itemDestName}>{dest.state}</span>
                <span className={styles.itemDestType}>{dest.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
