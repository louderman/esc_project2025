import styles from './errormsgbox.module.css';

export default function ErrorMsgBox({ errorMsg }: { errorMsg: string }) {
  return (
    <div className={styles.container} data-testid='error-msg-box'>
      {errorMsg}
    </div>
  );
}
