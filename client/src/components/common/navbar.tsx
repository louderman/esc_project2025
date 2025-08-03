import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './authcontext';
import styles from './navbar.module.css';

export default function NavBar() {
  const { user, setUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure NavBar syncs if user manually refreshes or navigates
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!user || user.email !== parsedUser.email) {
        setUser(parsedUser);
      }
    } else {
      if (user) setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.brandSection}>
          <img className={styles.logoImg} src="/navbar/logo.svg" alt="logo" />
          <div className={styles.appNameText}>
            <span className={styles.appNameText1}>C4T2</span>{' '}
            <span className={styles.appNameText2}>Amazing Hotel</span>
          </div>
        </div>

        <div className={styles.userSection}>
          <div className={styles.currencySection}>SGD En</div>

          {user ? (
            <div className={styles.dropdown}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={styles.dropdownButton}
              >
                {user.name}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownContent}>
                  <button onClick={handleLogout} className={styles.logoutOption}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className={`${styles.accountButton} ${styles.loginButton}`}
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
              >
                <img src="/navbar/user.svg" alt="login" />
                <span>Login</span>
              </button>
              <button
                className={`${styles.accountButton} ${styles.registerButton}`}
                onClick={() => navigate('/register', { state: { from: location.pathname } })}
              >
                <img src="/navbar/user.svg" alt="register" />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
