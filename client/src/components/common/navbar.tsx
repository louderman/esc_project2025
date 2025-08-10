import { useNavigate, useLocation, Link } from 'react-router-dom';
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
        <Link to='/'>
          <div className={styles.brandSection}>
            <img src='/navbar/C4T2.svg' className={styles.logo} />
          </div>
        </Link>

        <div className={styles.navigationSection}>
          {user && (
            <Link to='/past_booking' className={styles.navLink}>
              Past Bookings
            </Link>
          )}
        </div>

        <div className={styles.userSection}>
          {user ? (
            <div className={styles.dropdown}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={styles.dropdownButton}
              >
                <div className={styles.profileIcon}>{user.name[0]}</div>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownContent}>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutOption}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className={`${styles.accountButton} ${styles.loginButton}`}
                onClick={() =>
                  navigate('/login', { state: { from: location.pathname } })
                }
              >
                <span>Login</span>
              </button>
              <button
                className={`${styles.accountButton} ${styles.registerButton}`}
                onClick={() =>
                  navigate('/register', { state: { from: location.pathname } })
                }
              >
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
