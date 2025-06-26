import styles from './searchbar.module.css';

export default function SearchBar() {
  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <img src='/listing/destination.svg' />
        <input
          className={styles.inputBox}
          type='text'
          placeholder='Destination'
        />
      </div>
      <div className={styles.inputWrapper}>
        <img src='/listing/calendar.svg' />
        <input
          className={styles.inputBox}
          type='text'
          placeholder='Date duration'
        />
      </div>
      <div className={styles.inputWrapper}>
        <img src='/listing/guest.svg' />
        <input
          className={styles.inputBox}
          type='text'
          placeholder='Guest count'
        />
      </div>
    </div>
  );
}
