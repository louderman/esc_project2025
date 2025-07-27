import styles from './bookingform.module.css';

// Define props for the component based on the Figma design
interface BookingFormProps {
  guaranteePolicy: string;
  cancelPolicy: string;
  costPerNight: number;
  numberOfNights: number;
}

export default function BookingForm({
  guaranteePolicy,
  cancelPolicy,
  costPerNight,
  numberOfNights,
}: BookingFormProps) {
  const totalCost = costPerNight * numberOfNights;

  return (
    <div className={styles.container}>
      <div className={styles.policies}>
        <h3>POLICIES</h3>
        <div className={styles.policy}>
          <h4>Guarantee Policy</h4>
          <p>{guaranteePolicy}</p>
        </div>
        <div className={styles.policy}>
          <h4>Cancel Policy</h4>
          <p>{cancelPolicy}</p>
        </div>
      </div>

      <div className={styles.cost}>
        <h3>Cost</h3>
        <div className={styles.costItem}>
          <span>${costPerNight} x {numberOfNights} nights</span>
          <span>${totalCost}</span>
        </div>
        <div className={`${styles.costItem} ${styles.total}`}>
          <span>Total</span>
          <span>${totalCost}</span>
        </div>
      </div>

      <div className={styles.personalDetails}>
        <h3>Personal Details</h3>
        <form>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">FIRST NAME</label>
              <input type="text" id="firstName" name="firstName" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">LAST NAME</label>
              <input type="text" id="lastName" name="lastName" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">EMAIL</label>
            <input type="email" id="email" name="email" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone">PHONE NUMBER</label>
            <input type="tel" id="phone" name="phone" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="creditCard">Credit card</label>
            <input type="text" id="creditCard" name="creditCard" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiry">Expiry</label>
              <input type="text" id="expiry" name="expiry" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="cvv">CVV</label>
              <input type="text" id="cvv" name="cvv" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="postalCode">Postal Code</label>
              <input type="text" id="postalCode" name="postalCode" />
            </div>
          </div>
          <button type="submit" className={styles.reserveButton}>RESERVE</button>
        </form>
      </div>
    </div>
  );
}
