import styles from './PaymentForm.module.css';

interface PaymentFormWrapperProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const PaymentFormWrapper = ({ amount, onPaymentSuccess, onPaymentError }: PaymentFormWrapperProps) => {
  return (
    <div className={styles.container}>
      <h3>Payment Details</h3>
      <div className={styles.stripeNotReady}>
        <p>Payment form will be available once Stripe is configured.</p>
        <div className={styles.formGroup}>
          <label>Card details</label>
          <div className={styles.cardElementPlaceholder}>
            Stripe payment form (requires Stripe Elements provider)
          </div>
        </div>
        <button
          type="button"
          disabled
          className={`${styles.payButton} ${styles.disabled}`}
        >
          Pay ${(amount / 100).toFixed(2)} (Stripe Setup Required)
        </button>
      </div>
    </div>
  );
};

export default PaymentFormWrapper;
