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
  hotelAddress?: string;
  numberOfNights?: number;
  numberOfRooms: number;
  adults: number;
  children?: number | null;
  totalAmount: number;
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

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "N/A"
      : new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
  }

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
            <h1 className={styles.pageTitle}>Booking History</h1>
            <p className={styles.subtitle}>Track your past and upcoming hotel stays</p>
          </div>

          <div className={styles.cardsContainer}>
            {bookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <img
                      src="/common/luggage_person.png"
                      alt="🧳"
                      style={{ width: '150px', height: '225px' }}
                    />
                  </div>
                  <h3 className={styles.emptyStateTitle}>Ready for your next adventure?</h3>
                  <p className={styles.emptyStateText}>
                    You haven't made any hotel bookings yet. Discover amazing hotels and create unforgettable memories!
                  </p>
                  <button 
                    className={styles.browseButton}
                    onClick={() => navigate('/listing')}
                  >
                    Start Searching
                  </button>
                </div>
            ) : (
              bookings.map(({ id, hotelName, checkInDate, checkOutDate, status, imageUrl, hotelAddress, numberOfNights, numberOfRooms, adults, children, totalAmount }) => (
                <div
                  key={id}
                  className={styles.bookingCard}
                  onClick={() => handleCardClick(id)}
                  style={{ cursor: 'pointer' }}
                >
                 <div className={styles.bookingImageWrapper}> 
                  <img
                    className={styles.bookingImg}
                    src={imageUrl ?? '/listing/hotel_img_placeholder.png'}
                    alt={hotelName}
                  />
                 </div> 
                  <div className={styles.cardRight}>
                    <div className={styles.hotelName}>{hotelName ?? 'Unknown hotel'}</div>
                    <div className={styles.hotelAddress}>
                      <span className={styles.icon}>📍</span> { hotelAddress ?? 'Location unavailable'}
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
                        <span className={styles.detailsLabel}>Duration:</span>{' '}
                        {numberOfNights}{numberOfNights === 1 ? ' night' : ' nights'}
                      </div>
                      <div>
                        <span className={styles.detailsLabel}>Details:</span>{' '}
                        {numberOfRooms ?? 0} Room{(numberOfRooms ?? 0) !== 1 ? 's' : ''}, {adults ?? 0} Adult{(adults ?? 0) !== 1 ? 's' : ''}
  {children && children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
                      </div>
                      <div>
                        <span className={styles.detailsLabel}>Total:</span>{' '}
                        {totalAmount != null ? `$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'}
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
