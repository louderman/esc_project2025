import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import styles from './listingpage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import FilterPanel from '../components/listing/ListingControl/FilterPanel';
import Listings from '../components/listing/Listings/Listings';
import {
  initialListingState,
  listingReducer,
  type FilterByOptions,
} from '../reducers/listingReducer';
import type { Hotel } from '../../../types/Hotel';
import type { Price, PriceResponse } from '../../../types/Price';
import { usePollingAsync } from '../hooks/usePollingAsync';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AmenityKey } from '../constants/amenities';
import { usePricedHotels } from '../hooks/hotels/usePricedHotels';
import { useFilteredHotels } from '../hooks/hotels/useFilteredHotels';

export default function ListingPage() {
  const navigate = useNavigate();

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
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [listingState, listingDispatch] = useReducer(
    listingReducer,
    initialListingState
  );

  const [loading, setLoading] = useState({
    price: true,
    hotel: true,
  });

  const fetchPrice = useCallback(async () => {
    console.log('fetching price');
    const response = await fetch(`/api/hotel-price/query/RsBU`);
    const data: PriceResponse = await response.json();
    if (data.completed) {
      setPrices(data.hotels);
      setLoading((prev) => ({ ...prev, price: false }));
    }
    return data.completed;
  }, []);
  usePollingAsync(fetchPrice, 5000);

  const fetchHotel = useCallback(async () => {
    console.log('fetching hotel');
    // setHotels(INIT_HOTELS);
    // return;
    const response = await fetch(`/api/hotel/query/RsBU`);
    const data: Hotel[] = await response.json();
    setHotels(data);
    setLoading((prev) => ({ ...prev, hotel: false }));
  }, []);
  useEffect(() => {
    fetchHotel();
  }, []);

  // Stitch, filter, and sort the hotels here
  const hotelsWithPrice = usePricedHotels(hotels, prices);
  const filteredHotels = useFilteredHotels(
    hotelsWithPrice,
    listingState.filterBy
  );

  // console.log(hotels);
  // console.log(prices);
  // console.log(hotelsWithPrice);

  /**
   * Synchronize URL query parameters with internal filter state.
   *
   * There are two responsibilities:
   * 1. On first load (component mount), read the current URL's query parameters
   *    and populate `listingState.filterBy` using them.
   * 2. After URL has been processed, whenever `listingState.filterBy` changes,
   *    reflect those changes in the URL without causing a page reload.
   *
   * Variables:
   * - `processedUrlParam`: Indicates whether we've completed reading the URL params
   *   and applied them to the filter state. Prevents overwriting the URL with default
   *   values on initial render.
   */
  const [processedUrlParam, setProcessedUrlParam] = useState(false);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    Object.keys(listingState.filterBy).forEach((filterName) => {
      const filterRaw = searchParams.get(filterName);
      if (filterRaw) {
        try {
          const filterParsed = JSON.parse(filterRaw);
          listingDispatch({
            type: 'SET_FILTER',
            payload: {
              [filterName]: filterParsed,
            },
          });
        } catch (e) {
          console.warn(`Error parsing url param ${filterName}: ${filterRaw}`);
        }
      }
    });

    setProcessedUrlParam(true);
  }, []);

  useEffect(() => {
    if (!processedUrlParam) {
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    let hasChanged = false;

    Object.entries(listingState.filterBy).forEach(([filterName, value]) => {
      const currentParam = searchParams.get(filterName);
      const valueString = JSON.stringify(value);

      if (currentParam !== valueString) {
        const key = filterName as keyof FilterByOptions;
        searchParams.set(key, valueString);
        hasChanged = true;
      }
    });

    if (hasChanged) {
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [listingState, processedUrlParam]);

  return (
    <div className={styles.container}>
      <div className={styles.searchbarSection}>
        <SearchBar
          userDest={userDest}
          setUserDest={setUserDest}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
        />
      </div>
      <div className={styles.mainSection}>
        <div className={styles.mainBox}>
          <div className={styles.filterSection}>
            <FilterPanel
              hotels={hotelsWithPrice}
              listingState={listingState}
              listingDispatch={listingDispatch}
            />
          </div>
          <div className={styles.listingSection}>
            <Listings hotels={filteredHotels} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

const INIT_HOTELS: (Hotel & Price)[] = [
  {
    id: '050G',
    imageCount: 62,
    latitude: 1.318685,
    longitude: 103.847882,
    name: 'ST Residences Novena',
    address: '145A Moulmein Road',
    address1: '145A Moulmein Road',
    rating: 4,
    distance: 11546.941685574,
    trustyou: {
      id: 'dede9a48-2f7c-49ae-9bd0-942a40e245e7',
      score: {
        overall: 85,
        kaligo_overall: 4.3,
        solo: 80,
        couple: 86,
        family: 80,
        business: null,
      },
    },
    categories: {
      overall: {
        name: 'Overall',
        score: 94,
        popularity: 4,
      },
      romantic_hotel: {
        name: 'Romantic Hotel',
        score: 72,
        popularity: 8.61548461538462,
      },
      family_hotel: {
        name: 'Family Hotel',
        score: 75,
        popularity: 11.2643140468227,
      },
      business_hotel: {
        name: 'Business Hotel',
        score: 85,
        popularity: 23.8462538461539,
      },
    },
    amenities_ratings: [
      {
        name: 'Food',
        score: 100,
      },
      {
        name: 'WiFi',
        score: 100,
      },
      {
        name: 'Service',
        score: 99,
      },
      {
        name: 'Amenities',
        score: 98,
      },
      {
        name: 'Location',
        score: 97,
      },
      {
        name: 'Comfort',
        score: 92,
      },
      {
        name: 'Breakfast',
        score: 80,
      },
      {
        name: 'Room',
        score: 79,
      },
    ],
    description:
      "Take advantage of recreation opportunities including an outdoor pool and a 24-hour fitness center. Additional amenities at this aparthotel include complimentary wireless internet access, concierge services, and a communal living room.\n\nFeatured amenities include dry cleaning/laundry services, a 24-hour front desk, and luggage storage. Free self parking is available onsite.\n\nMake yourself at home in one of the 38 individually furnished guestrooms, featuring kitchenettes with refrigerators and microwaves. 40-inch LED televisions with cable programming provide entertainment, while complimentary wireless internet access keeps you connected. Conveniences include safes and desks, and housekeeping is provided weekly.\n\nDistances are displayed to the nearest 0.1 mile and kilometer. \u003Cbr /\u003E \u003Cp\u003EMount Elizabeth Novena Hospital - 0.7 km / 0.4 mi \u003Cbr /\u003E City Square Mall - 1.5 km / 0.9 mi \u003Cbr /\u003E Mustafa Centre - 1.6 km / 1 mi \u003Cbr /\u003E The Paragon - 2.5 km / 1.6 mi \u003Cbr /\u003E Bugis Street Shopping District - 2.6 km / 1.6 mi \u003Cbr /\u003E Mount Elizabeth Medical Center - 2.6 km / 1.6 mi \u003Cbr /\u003E Orchard Road - 2.6 km / 1.6 mi \u003Cbr /\u003E Takashimaya Shopping Centre - 2.7 km / 1.7 mi \u003Cbr /\u003E Orchard Central - 2.8 km / 1.7 mi \u003Cbr /\u003E Haji Lane - 2.8 km / 1.8 mi \u003Cbr /\u003E Sultan Mosque - 2.8 km / 1.8 mi \u003Cbr /\u003E Lucky Plaza - 2.9 km / 1.8 mi \u003Cbr /\u003E Bugis+ Shopping Center - 2.9 km / 1.8 mi \u003Cbr /\u003E Orchard Tower - 3 km / 1.8 mi \u003Cbr /\u003E Bugis Junction Shopping Center - 3 km / 1.8 mi \u003Cbr /\u003E \u003C/p\u003E\u003Cp\u003EThe nearest airports are:\u003Cbr /\u003ESeletar Airport (XSP) - 13.7 km / 8.5 mi\u003Cbr /\u003E Singapore Changi Airport (SIN) - 21.4 km / 13.3 mi\u003Cbr /\u003E Senai International Airport (JHB) - 71 km / 44.1 mi\u003Cbr /\u003E \u003C/p\u003E\u003Cp\u003E\u003C/p\u003E\n\nWith a stay at ST Residences Novena, you'll be centrally located in Singapore, within a 5-minute drive of Orchard Road and Mustafa Centre.  This boutique aparthotel is 3.3 mi (5.3 km) from Marina Bay Sands Skypark and 3.6 mi (5.8 km) from Marina Bay Sands Casino.\n\nIn Singapore (Novena)",
    amenities: {
      airConditioning: true,
      clothingIron: true,
      continentalBreakfast: true,
      dataPorts: true,
      hairDryer: true,
      kitchen: true,
      outdoorPool: true,
      parkingGarage: true,
      safe: true,
      tVInRoom: true,
      voiceMail: true,
    },
    original_metadata: {
      name: null,
      city: 'Singapore',
      state: null,
      country: 'SG',
    },
    image_details: {
      suffix: '.jpg',
      count: 62,
      prefix: 'https://d2ey9sqrvkqdfs.cloudfront.net/050G/',
    },
    hires_image_index:
      '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51',
    number_of_images: 54,
    default_image_index: 1,
    imgix_url: 'https://kaligo-web-expedia.imgix.net',
    cloudflare_image_url: 'https://www.kaligo-staging.xyz/images/new',
    checkin_time: '3:00 PM',
    searchRank: 0.93,
    price_type: 'multi',
    free_cancellation: false,
    rooms_available: 29994,
    max_cash_payment: 3988.13,
    coverted_max_cash_payment: 5206.27,
    points: 130150,
    bonuses: 0,
    bonus_programs: [],
    bonus_tiers: [],
    lowest_price: 3988.13,
    price: 5206.27,
    converted_price: 5206.27,
    lowest_converted_price: 5206.27,
    market_rates: [
      {
        rate: 0,
        supplier: '',
      },
    ],
  },
  {
    id: '0dAF',
    imageCount: 0,
    latitude: 1.27939856052399,
    longitude: 103.84058380127,
    name: 'New Majestic Hotel',
    address: '31-37 Bukit Pasoh Road',
    address1: '31-37 Bukit Pasoh Road',
    rating: 4,
    distance: 11546.1547903411,
    trustyou: {
      id: 'd515d75b-825a-47f2-85d7-9763bc2c2c90',
      score: {
        overall: 85,
        kaligo_overall: 4.3,
        solo: 85,
        couple: 86,
        family: 77,
        business: 79,
      },
    },
    categories: {
      overall: {
        name: 'Overall',
        score: 85,
        popularity: 21,
      },
      luxury_hotel: {
        name: 'Luxury Hotel',
        score: 98,
        popularity: 3.98003311036789,
      },
      boutique_hotel: {
        name: 'Boutique Hotel',
        score: 86,
        popularity: 5.30444782608696,
      },
      romantic_hotel: {
        name: 'Romantic Hotel',
        score: 79,
        popularity: 6.95996622073579,
      },
    },
    amenities_ratings: [
      {
        name: 'Location',
        score: 98,
      },
      {
        name: 'Bar',
        score: 96,
      },
      {
        name: 'Service',
        score: 95,
      },
      {
        name: 'WiFi',
        score: 88,
      },
      {
        name: 'Comfort',
        score: 87,
      },
      {
        name: 'Room',
        score: 75,
      },
      {
        name: 'Food',
        score: 71,
      },
      {
        name: 'Breakfast',
        score: 54,
      },
    ],
    description:
      "\u003Cp\u003E\u003Cb\u003EProperty Location\u003C/b\u003E \u003Cbr /\u003EA stay at New Majestic Hotel places you in the heart of Singapore, walking distance from NUS BaBa House and Baba House.  This 4-star hotel is close to Chinatown Heritage Center and \u003Cb\u003EUniversal Studios Singapore\u003C/b\u003E®.\u003C/p\u003E\u003Cp\u003E\u003Cb\u003ERooms\u003C/b\u003E \u003Cbr /\u003EMake yourself at home in one of the 30 individually decorated guestrooms, featuring minibars (stocked with some free items) and LED televisions. Complimentary wireless Internet access keeps you connected, and cable programming is available for your entertainment. Private bathrooms with showers feature designer toiletries and hair dryers. Conveniences include safes and desks, as well as phones with free local calls.\u003C/p\u003E\u003Cp\u003E\u003Cb\u003EAmenities\u003C/b\u003E \u003Cbr /\u003ETake advantage of recreation opportunities including an outdoor pool and a fitness center. Additional features include complimentary wireless Internet access and concierge services.\u003C/p\u003E\u003Cp\u003E\u003Cb\u003EDining\u003C/b\u003E \u003Cbr /\u003ESatisfy your appetite at the hotel's restaurant, which serves breakfast, lunch, and dinner, or stay in and take advantage of room service (during limited hours).\u003C/p\u003E\u003Cp\u003E\u003Cb\u003EBusiness, Other Amenities\u003C/b\u003E \u003Cbr /\u003EFeatured amenities include limo/town car service, dry cleaning/laundry services, and a 24-hour front desk.\u003C/p\u003E",
    amenities: {
      airConditioning: true,
      clothingIron: true,
      continentalBreakfast: true,
      dataPorts: true,
      dryCleaning: true,
      hairDryer: true,
      miniBarInRoom: true,
      outdoorPool: true,
      parkingGarage: true,
      roomService: true,
      safe: true,
      tVInRoom: true,
    },
    original_metadata: {
      name: null,
      city: 'Singapore',
      state: null,
      country: 'SG',
    },
    image_details: {
      suffix: '.jpg',
      count: 0,
      prefix: 'https://d2ey9sqrvkqdfs.cloudfront.net/0dAF/',
    },
    hires_image_index:
      '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54',
    number_of_images: 0,
    default_image_index: 1,
    imgix_url: 'https://kaligo-web-old.imgix.net',
    cloudflare_image_url: 'https://www.kaligo-staging.xyz/images/new',
    checkin_time: '',
    searchRank: 0.93,
    price_type: 'multi',
    free_cancellation: true,
    rooms_available: 60,
    max_cash_payment: 2396.52,
    coverted_max_cash_payment: 3128.52,
    points: 78200,
    bonuses: 0,
    bonus_programs: [],
    bonus_tiers: [],
    lowest_price: 2396.52,
    price: 3128.52,
    converted_price: 3128.52,
    lowest_converted_price: 3128.52,
    market_rates: [
      {
        rate: 0,
        supplier: '',
      },
    ],
  },
];
