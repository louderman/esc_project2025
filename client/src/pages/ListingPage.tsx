import { useState } from 'react';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './listingpage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';

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
      <div className={styles.contentSection}>
        <div className={styles.toolbarSection}></div>
        <div className={styles.listingSection}></div>
      </div>
    </div>
  );
}
