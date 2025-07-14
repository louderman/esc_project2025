import DateInput, { type StayDatesState } from './DateInput/DateInput';
import DestinationInput from './DestinationInput/DestinationInput';
import GuestInput, { type OccupancyState } from './GuestInput/GuestInput';
import styles from './searchbar.module.css';
import { Link } from 'react-router-dom';

export default function SearchBar({
  userDest,
  setUserDest,
  stayDates,
  setStayDates,
  occupancy,
  setOccupancy,
}: {
  userDest: string;
  setUserDest: React.Dispatch<React.SetStateAction<string>>;
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
  occupancy: OccupancyState;
  setOccupancy: React.Dispatch<React.SetStateAction<OccupancyState>>;
}) {
  return (
    <div className={styles.container}>
      <DestinationInput userDest={userDest} setUserDest={setUserDest} />
      <DateInput stayDates={stayDates} setStayDates={setStayDates} />
      <GuestInput occupancy={occupancy} setOccupancy={setOccupancy} />
      <Link to="/listing">
        <button className={styles.searchButton}>Find Hotels</button>
      </Link>
    </div>
  );
}
