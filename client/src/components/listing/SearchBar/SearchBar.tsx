import DateInput from './DateInput';
import DestinationInput from './DestinationInput';
import GuestInput from './GuestInput';
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
