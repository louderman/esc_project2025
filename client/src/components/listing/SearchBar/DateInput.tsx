import styles from './inputbox.module.css';

export default function DateInput() {
  return (
    <div className={styles.inputWrapper}>
      <img src='/listing/calendar.svg' />
      <input
        className={styles.inputBox}
        type='text'
        placeholder='Date duration'
      />
    </div>
  );
}
