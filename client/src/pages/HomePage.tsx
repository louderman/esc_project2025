import { useState } from 'react';
import SearchBar from '../components/homepage/SearchBar/SearchBar';
import type { StayDatesState } from '../components/homepage/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/homepage/SearchBar/GuestInput/GuestInput';

import styles from './homepage.module.css';



export default function HomePage() {


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
        <div className={styles.headerQuestion}>Looking for a place to stay?</div>
        <SearchBar
          userDest={userDest}
          setUserDest={setUserDest}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
        />
      </div>
    </div>
  );
}
