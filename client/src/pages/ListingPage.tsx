import SearchBar from '../components/listing/SearchBar';
import styles from './listingpage.module.css';
export default function ListingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.searchbarSection}>
        <SearchBar />
      </div>
      <div className={styles.contentSection}></div>
    </div>
  );
}
