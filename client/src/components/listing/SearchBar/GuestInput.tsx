import styles from './inputbox.module.css';

export default function GuestInput() {
  return (
    <div className={styles.inputWrapper}>
      <img src='/listing/guest.svg' />
      <input
        className={styles.inputBox}
        type='text'
        placeholder='Guest count'
      />
    </div>
  );
}
