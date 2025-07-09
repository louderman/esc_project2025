import { useEffect, useState } from 'react';
import type { Hotel } from '../../../../../types/Hotel';
import ListingCard from './ListingCard';
import styles from './listings.module.css';
import type { Price } from '../../../../../types/Price';

const ITEMS_PER_PAGE = 10;

export default function Listings({
  hotels,
  loading,
}: {
  hotels: (Hotel & Price)[];
  loading: { hotel: boolean; price: boolean };
}) {
  const [page, setPage] = useState(1);

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
  }, [page, hotels]);

  return (
    <div className={styles.container}>
      {hotels.slice(0, page * ITEMS_PER_PAGE).map((hotel) => (
        <ListingCard key={`listing-card-${hotel.id}`} hotel={hotel} />
      ))}
    </div>
  );
}
