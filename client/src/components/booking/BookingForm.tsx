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
    </div>
  );
}
