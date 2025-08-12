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

  // const formatDate = (dateStr: string) => {
  //   if (!dateStr || dateStr === 'N/A') return 'N/A';

  //   //If date format has no year 
  //   let fullDateStr = dateStr;
  //   if (!/\d{4}/.test(dateStr)) { 
  //     const currentYear = new Date().getFullYear();
  //     fullDateStr = `${dateStr} ${currentYear}`;
  //   }

  //   const date = new Date(fullDateStr);
  //   return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  // };

  const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';

  // Map of valid month abbreviations
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const trimmed = dateStr.trim();
  // Accepts: "Mon DD" or "Mon DD YYYY" or "Mon DD, YYYY"
  const normalized = trimmed.replace(',', '').replace(/\s+/g, ' ');
  const match = normalized.match(/^([A-Za-z]{3})\s+(\d{1,2})(?:\s+(\d{4}))?$/);
  if (!match) return 'N/A';

  const monAbbr = match[1];
  const day = Number(match[2]);
  if (!(monAbbr in monthMap)) return 'N/A';

  const year = match[3] ? Number(match[3]) : new Date().getFullYear();
  const d = new Date(year, monthMap[monAbbr], day);

  // Validate constructed date (avoid Feb 30 etc.)
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== monthMap[monAbbr] ||
    d.getDate() !== day
  ) {
    return 'N/A';
  }

  // Always return in DD/MM/YYYY
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
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
              bookings.map(({ id, hotelName, checkInDate, checkOutDate, status, imageUrl, bookingAddress }) => (
                <div
                  key={id}
                  className={styles.bookingCard}
                  onClick={() => handleCardClick(id)}
                  style={{ cursor: 'pointer' }}
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
