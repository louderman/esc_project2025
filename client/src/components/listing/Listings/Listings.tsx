import { useEffect, type SetStateAction } from 'react';
import type { Hotel } from '../../../../../types/Hotel';
import ListingCard from './ListingCard';
import styles from './listings.module.css';
import type { Price } from '../../../../../types/Price';
import ListingCardSkeleton from './ListingCardSkeleton';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';

const ITEMS_PER_PAGE = 10;

export default function Listings({
  page,
  setPage,
  hotels,
  loading,
  stayDates,
  occupancy,
}: {
  page: number;
  setPage: React.Dispatch<SetStateAction<number>>;
  hotels: (Hotel & Price)[];
  loading: { hotel: boolean; price: boolean };
  stayDates: StayDatesState;
  occupancy: OccupancyState;
}) {
  const isLoading = Object.values(loading).some((l) => l);
  const hasHotel = hotels.length > 0;

  useEffect(() => {
    function handleScroll() {
      if (
        Object.values(loading).some(Boolean) ||
        page * ITEMS_PER_PAGE > hotels.length
      ) {
        return;
      }
      if (
        window.innerHeight + window.scrollY <
        document.body.scrollHeight - 300
      ) {
        return;
      }

      setPage((prev) => prev + 1);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hotels, loading, setPage]);

  return (
    <div className={styles.container}>
      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <ListingCardSkeleton key={`skeleton-${i}`} />
        ))}

      {!isLoading &&
        hasHotel &&
        hotels
          .slice(0, page * ITEMS_PER_PAGE)
          .map((hotel) => (
            <ListingCard
              stayDates={stayDates}
              key={`listing-card-${hotel.id}`}
              hotel={hotel}
              occupancy={occupancy}
            />
          ))}

      {!isLoading && !hasHotel && (
        <div>
          <span className={styles.noHotelText}>No Hotel Found</span>
          <span className={styles.noHotelSubtext}>
            Please try changing destination name or adjust filtering
          </span>
        </div>
      )}
    </div>
  );
}
