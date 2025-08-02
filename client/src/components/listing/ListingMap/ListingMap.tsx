import GoogleMap from './GoogleMap';
import styles from './listingmap.module.css';
import FilterPanel from '../ListingControl/FilterPanel';
import {
  initialListingState,
  listingReducer,
} from '../../../reducers/listingReducer';
import MapListingCard from './MapListingCard';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import MapListingCardSkeleton from './MapListingCardSkeleton';
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type SetStateAction,
} from 'react';
import type { Destination } from '../../../../../types/Destination';
import { useFetchHotels } from '@/hooks/hotels/useFetchHotels';
import { useFetchHotelPrices } from '@/hooks/hotels/useFetchHotelPrices';
import { usePricedHotels } from '@/hooks/hotels/usePricedHotels';
import { useFilteredHotels } from '@/hooks/hotels/useFilteredHotels';

const ITEMS_PER_PAGE = 10;
type LatLng = {
  lat: number;
  lng: number;
};

export default function ListingMap({
  stayDates,
  occupancy,
  latLng,
  setShowMap,
}: {
  stayDates: StayDatesState;
  occupancy: OccupancyState;
  latLng: LatLng;
  setShowMap: React.Dispatch<SetStateAction<boolean>>;
}) {
  // TODO: disable bg scrolling if possible

  const [listingState, listingDispatch] = useReducer(
    listingReducer,
    initialListingState
  );

  const [destinations, setDestinations] = useState<Destination[]>([]);

  const firstThreeDests = destinations.slice(0, 3).map((d) => d.dest_id);
  const { hotels, loading: hotelLoading } = useFetchHotels(firstThreeDests, {
    cache: true,
  });
  const { prices, loading: priceLoading } = useFetchHotelPrices(
    firstThreeDests,
    stayDates,
    occupancy,
    3000,
    { cache: true, fetchOnMountOnly: false }
  );
  const pricedHotels = usePricedHotels(hotels, prices);
  const filteredHotels = useFilteredHotels(pricedHotels, listingState.filterBy);
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null); // hovered hotel in hotel listings

  const isLoading = hotelLoading || priceLoading;
  // console.log('dests', destinations);
  // console.log(
  //   'hotels',
  //   hotels.sort((a, b) => a.id.localeCompare(b.id))
  // );
  //   console.log('prices', prices);
  // console.log('filteredHotels', filteredHotels);
  console.log('loading', 'hotel', hotelLoading, 'price', priceLoading);

  const [page, setPage] = useState(1);
  const listingSectionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = listingSectionRef.current;
    if (!el) return;

    function handleScroll() {
      if (isLoading || page * ITEMS_PER_PAGE > hotels.length || !el) {
        return;
      }

      const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (scrollBottom < 300) {
        setPage((prev) => prev + 1);
      }
    }
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [page, hotels, isLoading, setPage]);

  useEffect(() => {
    const el = listingSectionRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(1);
  }, [listingState.filterBy, listingState.sortBy]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebarSection}>
        <div className={styles.filterSection}>
          <FilterPanel
            hotels={pricedHotels}
            listingDispatch={listingDispatch}
            listingState={listingState}
          />
        </div>
        <div ref={listingSectionRef} className={styles.listingSection}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <MapListingCardSkeleton key={`skeleton-${i}`} />
            ))}
          {!isLoading &&
            filteredHotels
              .slice(0, ITEMS_PER_PAGE * page)
              .map((hotel) => (
                <MapListingCard
                  hotel={hotel}
                  occupancy={occupancy}
                  stayDates={stayDates}
                  setHoveredHotelId={setHoveredHotelId}
                  key={`map-listing-card-${hotel.id}`}
                />
              ))}
        </div>
      </div>
      <div className={styles.mapSection}>
        <GoogleMap
          latLng={latLng}
          hotels={filteredHotels}
          hoveredHotelId={hoveredHotelId}
          stayDates={stayDates}
          occupancy={occupancy}
          destinations={destinations}
          setDestinations={setDestinations}
          setShowMap={setShowMap}
          listingDispatch={listingDispatch}
        />
      </div>
    </div>
  );
}
