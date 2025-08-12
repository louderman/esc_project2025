import { useState } from 'react';
import DateInput, { type StayDatesState } from './DateInput/DateInput';
import DestinationInput, {
  type DestinationState,
} from './DestinationInput/DestinationInput';
import GuestInput, { type OccupancyState } from './GuestInput/GuestInput';
import styles from './searchbar.module.css';

export type SearchbarErrorState = {
  destination: string;
  stayDate: string;
};

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
  const [errorMsg, setErrorMsg] = useState<SearchbarErrorState>({
    destination: '',
    stayDate: '',
  });

  function handleSubmit() {
    let hasError = false;

    if (destination.name === '') {
      setErrorMsg((prev) => ({
        ...prev,
        destination: 'Destination name cannot be empty.',
      }));
      hasError = true;
    }

    if (stayDates.checkinDate === null || stayDates.checkoutDate === null) {
      setErrorMsg((prev) => ({
        ...prev,
        stayDate: 'Stay dates cannot be empty.',
      }));
      hasError = true;
    }

    if (!hasError) {
      onSubmit();
    }
  }

  return (
    <div className={styles.container} data-cy='search-bar'>
      <DestinationInput
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        destination={destination}
        setDestination={setDestination}
      />
      <DateInput
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        stayDates={stayDates}
        setStayDates={setStayDates}
      />
      <GuestInput occupancy={occupancy} setOccupancy={setOccupancy} />
      <button className={styles.searchButton} onClick={handleSubmit}>
        Find Hotels
      </button>
    </div>
  );
}
