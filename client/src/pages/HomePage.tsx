import { useEffect, useState } from 'react';

import styles from './homepage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import type { Destination } from '../../../types/Destination';
import { useNavigate } from 'react-router-dom';
import { useSearchBarUrlSync } from '../hooks/url/useSearchBarUrlSync';

import DestinationCard from '../components/homepage/DestinationCard';


export default function HomePage() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });
  let today: Date = new Date();
  let tomorrow: Date = new Date();
  today.setDate(new Date().getDate()+1)
  tomorrow.setDate(new Date().getDate()+2)
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: today,
    checkoutDate: tomorrow,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 1,
    children: 0,
    rooms: 1,
  });

  const { syncSearchBarToURL } = useSearchBarUrlSync({
    destination,
    setDestination,
    occupancy,
    setOccupancy,
    stayDates,
    setStayDates,
    navigate,
  });


  const [suggestedDests, setSuggestedDests] = useState<Destination[]>([]);
  useEffect(() => {
    async function fetchRandomSuggestions() {
      let url = `/api/destination/random?count=8`;
      const res = await fetch(url, { method: 'GET' });
      const dests: Destination[] = await res.json();
      setSuggestedDests(dests)
    }
    fetchRandomSuggestions()
  }, []);
  
  function handleSuggestionClick(dest: Destination) {
    let destination: DestinationState = { id: dest.dest_id, name: dest.term };
    setDestination(destination)
    syncSearchBarToURL('/listing')
  }

  function handleSearchHotel() {
    if (destination.id=='') { return; }
    // navigate('/listing', {state: {destination: destination, occupancy: occupancy, stayDates: stayDates}})
    syncSearchBarToURL('/listing')
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchbarSection}>
        <div className={styles.headerQuestion}>
          Looking for a place to stay?
        </div>
        <SearchBar
          destination={destination}
          setDestination={setDestination}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
          onSubmit={handleSearchHotel}
        />
      </div>
      
      
      <div className={styles.destinationSuggestion}>
        <div className={styles.destinationSuggestionHeader}>
          Find Hotels in These Cities
        </div>
        <div className={styles.destinationSuggestionSubHeader}>
          Explore the world at the lowest cost!
        </div>
        <div className={styles.destinationSuggestionsBox}>
          {suggestedDests.map((dest, index) => (
            <div className={styles.destinationSuggestionsItem}>
              <DestinationCard
                url='https://d2ey9sqrvkqdfs.cloudfront.net/5CCH/0.jpg'
                dest={dest}
                onclick={handleSuggestionClick}
              />
            </div>
          ))}
        </div>
      </div>
      

      <footer className={styles.footer}>
        <div className={styles.qualitiesHeader}>
          Why Choose Us
        </div>
        <div className={styles.qualitiesBox}>
          <div className={styles.qualityItem}>
            Destinations from across the world
          </div>
          <div className={styles.qualityItem}>
            Experienced agents
          </div>
          <div className={styles.qualityItem}>
            Buy or rent your home
          </div>
          <div className={styles.qualityItem}>
            Cheapest prices available
          </div>
        </div>
      </footer>
    </div>
  );
}
