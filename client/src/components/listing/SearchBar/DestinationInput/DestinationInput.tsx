import { useEffect, useState, type ChangeEvent } from 'react';
import inputStyles from '../inputbox.module.css';
import styles from './destinationinput.module.css';
import { type Destination } from '../../../../../../types/Destination';
import { useDebounceAsync } from '../../../../hooks/useDebounceAsync';

// TODO: replace onMouseDown?

export type DestinationState = {
  id: string; // null if user input destination name not in destination.json file
  name: string;
};

export default function DestinationInput({
  destination,
  setDestination,
}: {
  destination: DestinationState;
  setDestination: React.Dispatch<React.SetStateAction<DestinationState>>;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedDests, setSuggestedDests] = useState<Destination[]>([]);

  function handleOnFocus() {
    setShowSuggestions(true);
  }

  function handleOnBlur() {
    setShowSuggestions(false);
  }

  useEffect(() => {
    async function fetchRandomDest() {
      const res = await fetch(`/api/destination/random?count=5`, {
        method: 'GET',
      });
      const dests: Destination[] = await res.json();
      setSuggestedDests(dests);
    }
    fetchRandomDest();
  }, []);

  const debouncedFetch = useDebounceAsync(async (userInput: string) => {
    const res = await fetch(`/api/destination/query/${userInput}?count=10`, {
      method: 'GET',
    });
    const dests: Destination[] = await res.json();
    return dests;
  }, 300);
  async function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    setDestination((prev) => ({ ...prev, name: e.target.value }));
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
        value={destination.name}
        onChange={handleOnChange}
      />
      {showSuggestions && (
        <ul className={styles.suggestionContainer}>
          {suggestedDests.map((dest, i) => (
            <li
              key={`dest-${i}`}
              onMouseDown={() =>
                setDestination({ id: dest.dest_id, name: dest.term })
              }
              className={styles.suggestionItem}
            >
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
