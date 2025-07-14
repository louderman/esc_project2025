import DateInput, { type StayDatesState } from './DateInput/DateInput';
import DestinationInput, {
  type DestinationState,
} from './DestinationInput/DestinationInput';
import GuestInput, { type OccupancyState } from './GuestInput/GuestInput';
import styles from './searchbar.module.css';

export default function SearchBar({
  destination,
  setDestination,
  stayDates,
  setStayDates,
  occupancy,
  setOccupancy,
  onSubmit,
}: {
  destination: DestinationState;
  setDestination: React.Dispatch<React.SetStateAction<DestinationState>>;
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
  occupancy: OccupancyState;
  setOccupancy: React.Dispatch<React.SetStateAction<OccupancyState>>;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.container}>
      <DestinationInput
        destination={destination}
        setDestination={setDestination}
      />
      <DateInput stayDates={stayDates} setStayDates={setStayDates} />
      <GuestInput occupancy={occupancy} setOccupancy={setOccupancy} />
      <button className={styles.searchButton} onClick={onSubmit}>
        Find Hotels
      </button>
    </div>
  );
}
