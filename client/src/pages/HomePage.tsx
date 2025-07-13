import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './listingpage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import FilterPanel from '../components/listing/ListingControl/FilterPanel';
import Listings from '../components/listing/Listings/Listings';
import {
  initialListingState,
  listingReducer,
} from '../reducers/listingReducer';
import type { Hotel } from '../../../types/Hotel';
import type { Price, PriceResponse } from '../../../types/Price';
import { usePollingAsync } from '../hooks/usePollingAsync';
import { useNavigate } from 'react-router-dom';
import { usePricedHotels } from '../hooks/hotels/usePricedHotels';
import { useFilteredHotels } from '../hooks/hotels/useFilteredHotels';
import SortPanel from '../components/listing/ListingControl/SortPanel';
import { useSortedHotels } from '../hooks/hotels/useSortedHotels';
import { useUrlSync } from '../hooks/url/useUrlSync';




export default function HomePage() {


  const [userDest, setUserDest] = useState<string>('');
  const [stayDates, setStayDates] = useState<StayDatesState>({
    startDate: null,
    endDate: null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 1,
    children: 0,
    rooms: 1,
  });

  return (
    <div>
      <SearchBar
        userDest={userDest}
        setUserDest={setUserDest}
        stayDates={stayDates}
        setStayDates={setStayDates}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
      />
    </div>
  );
}
