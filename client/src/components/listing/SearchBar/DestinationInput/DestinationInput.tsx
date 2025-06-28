import { useState, type ChangeEvent } from 'react';
import inputStyles from '../inputbox.module.css';
import styles from './destinationinput.module.css';
import { type Destination } from '../../../../../../types/Destination';
import { useDebounceAsync } from '../../../../hooks/useDebounceAsync';

// TODO: replace onMouseDown

export default function DestinationInput() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedDests, setSuggestedDests] = useState<Destination[]>([]);
  const [userDest, setUserDest] = useState<string>('');

  function handleOnFocus() {
    setShowSuggestions(true);
  }

  function handleOnBlur() {
    setShowSuggestions(false);
  }

  const debouncedFetch = useDebounceAsync(async (userInput: string) => {
    const res = await fetch(`/api/destination/like/${userInput}`, {
      method: 'GET',
    });
    const dests: Destination[] = await res.json();
    return dests;
  }, 300);
  async function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    setUserDest(e.target.value);
    const dests = await debouncedFetch(e.target.value);
    setSuggestedDests(dests);
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
        onChange={handleOnChange}
      />
      {showSuggestions && (
        <ul className={styles.suggestionContainer}>
          {suggestedDests.map((dest, i) => (
            <li
              key={`dest-${i}`}
              onMouseDown={() => setUserDest(dest.term)}
              className={styles.suggestionItem}>
              <img src='/listing/destination_gray.svg' />
              <div className={styles.itemTextSection}>
                <span className={styles.itemDestName}>{dest.term}</span>
                <span className={styles.itemDestType}>{dest.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
