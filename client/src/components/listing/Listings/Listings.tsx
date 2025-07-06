import { useEffect, useMemo, useState } from 'react';
import type { Hotel } from '../../../../../types/Hotel';
import ListingCard from './ListingCard';
import styles from './listings.module.css';
import type { Price } from '../../../../../types/Price';

const ITEMS_PER_PAGE = 10;

export default function Listings({
  hotels,
  prices,
  loading,
}: {
  hotels: Hotel[];
  prices: Price[];
  loading: { hotel: boolean; price: boolean };
}) {
  const [page, setPage] = useState(1);

  const hotelsWithPrice = useMemo(() => {
    // TODO: Enhance the algorithm
    return hotels;
    console.log('trying to stitch hotel + price...');
    return prices.flatMap((price) => {
      const hotel = hotels.find((h) => h.id === price.id);
      return hotel ? [{ ...hotel, ...price }] : [];
    });
  }, [hotels, prices]);
  console.log(hotelsWithPrice);

  useEffect(() => {
    function handleScroll() {
      if (
        Object.values(loading).some(Boolean) ||
        page * ITEMS_PER_PAGE > hotelsWithPrice.length
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
  }, [page, hotelsWithPrice]);

  return (
    <div className={styles.container}>
      {hotelsWithPrice.slice(0, page * ITEMS_PER_PAGE).map((hotel) => (
        <ListingCard key={`listing-card-${hotel.id}`} hotel={hotel} />
      ))}
    </div>
  );
}
