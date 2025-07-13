import { useEffect, type SetStateAction } from 'react';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import ListingCard from './ListingCard';
import styles from './listings.module.css';
import ListingCardSkeleton from './ListingCardSkeleton';

const ITEMS_PER_PAGE = 10;

export default function Listings({
  page,
  setPage,
  hotels,
  loading,
  stayDates,
}: {
  page: number;
  setPage: React.Dispatch<SetStateAction<number>>;
  hotels: (Hotel & Price)[];
  loading: { hotel: boolean; price: boolean };
  stayDates: StayDatesState;
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
