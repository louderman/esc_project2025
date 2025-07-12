import styles from './navbar.module.css';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.brandSection}>
          <img className={styles.logoImg} src='/navbar/logo.svg' alt='logo' />
          <div className={styles.appNameText}>
            <span className={styles.appNameText1}>C4T2</span>{' '}
            <span className={styles.appNameText2}>Amazing Hotel</span>
          </div>
        </div>
        <div className={styles.userSection}>
          <div className={styles.currencySection}>SGD En</div>

          <button
            className={`${styles.accountButton} ${styles.loginButton}`}
            onClick={() => navigate('/login')}
          >
            <img src='/navbar/user.svg' /> <span>Login</span>
          </button>

          <button
            className={`${styles.accountButton} ${styles.registerButton}`}
            onClick={() => navigate('/register')}
          >
            <img src='/navbar/user.svg' />
            <span>Register</span>
          </button>
        </div>
      </div>
    </div>
  );
}
