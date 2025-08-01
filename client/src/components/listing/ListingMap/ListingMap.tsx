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
import type { DestinationState } from '../SearchBar/DestinationInput/DestinationInput';
import { useReducer, useState } from 'react';
import type { Destination } from '../../../../../types/Destination';
import { useFetchHotels } from '@/hooks/hotels/useFetchHotels';
import { useFetchHotelPrices } from '@/hooks/hotels/useFetchHotelPrices';
import { usePricedHotels } from '@/hooks/hotels/usePricedHotels';
import { useFilteredHotels } from '@/hooks/hotels/useFilteredHotels';

export default function ListingMap({
  stayDates,
  occupancy,
}: // listingState,
// listingDispatch,
{
  stayDates: StayDatesState;
  occupancy: OccupancyState;
  initDest: DestinationState;
  // listingState: ListingState;
  // listingDispatch: React.ActionDispatch<[action: ListingAction]>;
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

  const isLoading = hotelLoading || priceLoading;
  // console.log('dests', destinations);
  // console.log(
  //   'hotels',
  //   hotels.sort((a, b) => a.id.localeCompare(b.id))
  // );
  // console.log('prices', prices);
  // console.log('filteredHotels', filteredHotels);
  console.log('loading', hotelLoading, priceLoading);

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
        <div className={styles.listingSection}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <MapListingCardSkeleton key={`skeleton-${i}`} />
            ))}
          {!isLoading &&
            filteredHotels
              .slice(0, 10)
              .map((hotel) => (
                <MapListingCard
                  hotel={hotel}
                  occupancy={occupancy}
                  stayDates={stayDates}
                  loading={isLoading}
                  key={`map-listing-card-${hotel.id}`}
                />
              ))}
        </div>
      </div>
      <div className={styles.mapSection}>
        <GoogleMap
          hotels={filteredHotels}
          destinations={destinations}
          setDestinations={setDestinations}
        />
      </div>
    </div>
  );
}
