import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './pastbookingpage.module.css';

interface Booking {
  id: string;
  userId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  bookingAddress?: string;
}

export default function PastBookingPage() {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      //using storedUser from localStorage
      const storedUser = localStorage.getItem('user');
      console.log('Stored user from localStorage:', storedUser);
      
      if (!storedUser) {
        setError('Please log in to view your booking history');
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        console.log('Parsed user:', user);
        console.log('User ID:', user.id);
        
        setLoading(true);
        
        //using userId
        const res = await fetch(`/api/booking-history/history/${user.id}`); //fetch bookings
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Booking[] = await res.json();
        console.log('Fetched bookings:', data);
        setBookings(data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const handleCardClick = (bookingId: string) => {
    navigate('/booking/confirmation', { state: { bookingId } });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <section className={styles.mainSection}>
          <div className={styles.mainBox}>
            <p>Loading your booking history...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <section className={styles.mainSection}>
          <div className={styles.mainBox}>
            <p>Error: {error}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.mainSection}>
        <div className={styles.mainBox}>
          <div className={styles.titleCard}>
            <h1 className={styles.pageTitle}>Past Bookings</h1>
            <p className={styles.subtitle}>View and manage your previous hotel reservations</p>
          </div>

          <div className={styles.cardsContainer}>
            {bookings.length === 0 ? (
              <p>No past bookings found for your account.</p>
            ) : (
              bookings.map(({ id, hotelName, checkInDate, checkOutDate, status, imageUrl, bookingAddress }) => (
                <div
                  key={id}
                  className={styles.bookingCard}
                  onClick={() => handleCardClick(id)}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(id); }}
                  role="button"
                  aria-label={`View details for booking at ${hotelName}`}
                >
                  <img
                    className={styles.bookingImg}
                    src={imageUrl ?? '/listing/hotel_img_placeholder.png'}
                    alt={hotelName}
                  />
                  <div className={styles.cardRight}>
                    <div className={styles.hotelName}>{hotelName ?? 'Unknown hotel'}</div>
                    <div className={styles.hotelAddress}>
                      <span className={styles.icon}>📍</span> { bookingAddress ?? 'Location unavailable'}
                    </div>
                    <div className={styles.detailsCol}>
                      <div>
                        <span className={styles.detailsLabel}>Booking ID</span> {id}
                      </div>
                      <div>
                        <span className={styles.detailsLabel}>Check-in Date</span>{' '}
                        {formatDate(checkInDate)}
                      </div>
                      <div>
                        <span className={styles.detailsLabel}>Check-out Date</span>{' '}
                        {formatDate(checkOutDate)}
                      </div>
                      <div>
                        <span className={styles.detailsLabel}>Status</span>{' '}
                        <span className={styles.statusConfirmed}>{status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
