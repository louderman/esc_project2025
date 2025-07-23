import { useState } from 'react';

import styles from './homepage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import { useNavigate } from 'react-router-dom';
import { useSearchBarUrlSync } from '../hooks/url/useSearchBarUrlSync';

export default function HomePage() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: null,
    checkoutDate: null,
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

  function handleSearchHotel() {
    // Handle empty user inputs here
    //
    //
    // TODO^

    syncSearchBarToURL('/listing');
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
    </div>
  );
}
