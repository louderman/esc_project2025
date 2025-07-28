import { useEffect, useState, type ChangeEvent } from 'react';
import inputStyles from '../inputbox.module.css';
import styles from './destinationinput.module.css';
import { type Destination } from '../../../../../../types/Destination';
import { useDebounceAsync } from '../../../../hooks/useDebounceAsync';
import { useSearchParams } from 'react-router-dom';

export type DestinationState = {
  id: string; 
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
  const [searchParams] = useSearchParams();

  function handleOnFocus() {
    setShowSuggestions(true);
  }

  function handleOnBlur() {
    setShowSuggestions(false);
  }

  useEffect(() => {
    async function fetchInitialDest() {
      try {
        // TODO: don't hardcode url param
        const urlDestName = searchParams.get('destName');
        let url;
        if (urlDestName && urlDestName.length > 0) {
          url = `/api/destination/query/${urlDestName}?count=10`;
        } else {
          url = `/api/destination/random?count=5`;
        }

        const res = await fetch(url, {
          method: 'GET',
        });
        
        if (!res.ok) {
          console.error('Failed to fetch destinations:', res.status);
          setSuggestedDests([]);
          return;
        }
        
        const dests: Destination[] = await res.json();
        setSuggestedDests(Array.isArray(dests) ? dests : []);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setSuggestedDests([]);
      }
    }
    fetchInitialDest();
  }, [searchParams]);

  const debouncedFetch = useDebounceAsync(async (userInput: string) => {
    const controller = new AbortController();

    // Don't make API call if input is empty or too short
    if (!userInput || userInput.trim().length < 2) {
      return [];
    }

    try {
      const res = await fetch(`/api/destination/query/${userInput}?count=10`, {
        signal: controller.signal,
      });
      
      if (!res.ok) {
        console.error('Failed to fetch destinations:', res.status);
        return [];
      }
      
      const dests: Destination[] = await res.json();
      return Array.isArray(dests) ? dests : [];
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error(e);
      }
      return [];
    }
  }, 300);
  async function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;

    setDestination((prev) => ({ ...prev, name: inputValue }));
    
    // Only call debouncedFetch if input has meaningful content
    if (inputValue && inputValue.trim().length >= 2) {
      const dests = await debouncedFetch(e.target.value);
      setSuggestedDests(dests);
      setDestination((prev) => ({
        ...prev,
        id: dests.length > 0 ? dests[0].dest_id : '',
      }));
    } else {
      // Clear suggestions if input is empty or too short
      setSuggestedDests([]);
      setDestination((prev) => ({
        ...prev,
        id: '',
      }));
    }
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
        value={destination.name ?? ''}
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
