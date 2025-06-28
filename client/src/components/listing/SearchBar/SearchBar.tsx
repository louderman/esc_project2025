import DateInput from './DateInput/DateInput';
import DestinationInput from './DestinationInput/DestinationInput';
import GuestInput from './GuestInput/GuestInput';
import styles from './searchbar.module.css';

export default function SearchBar() {
  return (
    <div className={styles.container}>
      <DestinationInput />
      <DateInput />
      <GuestInput />
      <button className={styles.searchButton}>Find Hotels</button>
    </div>
  );
}
