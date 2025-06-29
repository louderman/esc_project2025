import { useState } from 'react';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './listingpage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import FilterPanel from '../components/listing/ListingControl/FilterPanel';

export default function ListingPage() {
  const [userDest, setUserDest] = useState<string>('');
  const [stayDates, setStayDates] = useState<StayDatesState>({
    startDate: null,
    endDate: null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 1,
    children: 0,
    rooms: 1,
  });

  return (
    <div className={styles.container}>
      <div className={styles.searchbarSection}>
        <SearchBar
          userDest={userDest}
          setUserDest={setUserDest}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
        />
      </div>
      <div className={styles.mainSection}>
        <div className={styles.mainBox}>
          <div className={styles.filterSection}>
            <FilterPanel />
          </div>
          <div className={styles.listingSection}>Listing Page Here</div>
        </div>
      </div>
    </div>
  );
}
