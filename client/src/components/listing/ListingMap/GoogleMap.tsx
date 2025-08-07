import { APIProvider, Map, type MapEvent } from '@vis.gl/react-google-maps';
import styles from './googlemap.module.css';
import { useMemo, useRef, type SetStateAction } from 'react';
import { useDebounceAsync } from '@/hooks/useDebounceAsync';
import type { Destination } from '../../../../../types/Destination';
import { mergeClosePoints } from '@/utils/listing/map/gridClustering';
import DestinationMarker from './Markers/DestinationMarker';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import HotelMarker from './Markers/HotelMarker';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import type { ListingAction } from '@/reducers/listingReducer';
import Close from '@/assets/Close';

const API_KEY = 'AIzaSyBta33S3S8OPr_m0uL-TNn3UTW8MSVF-L8';
const MAP_ID = 'a8079e059f31bc15534a6a3a';

export type MapBound = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};
type LatLng = {
  lat: number;
  lng: number;
};

// Reference: https://www.youtube.com/watch?v=PfZ4oLftItk&ab_channel=GoogleMapsPlatform
export default function GoogleMap({
  latLng,
  hotels,
  hoveredHotelId,
  occupancy,
  stayDates,
  destinations,
  setDestinations,
  setShowMap,
  listingDispatch,
}: {
  latLng: LatLng;
  hotels: (Hotel & Price)[];
  hoveredHotelId: string | null;
  occupancy: OccupancyState;
  stayDates: StayDatesState;
  destinations: Destination[];
  setDestinations: React.Dispatch<SetStateAction<Destination[]>>;
  setShowMap: React.Dispatch<SetStateAction<boolean>>;
  listingDispatch: React.ActionDispatch<[action: ListingAction]>;
}) {
  const center = latLng;
  const mapRef = useRef<google.maps.Map | null>(null);

  // TODO: FIX debounce not cancelling previous action

  const mergedHotels = useMemo(() => {
    if (!mapRef.current) {
      return [];
    }

    const hotelLatLngs = hotels.map((h) => [h.latitude, h.longitude]) as [
      number,
      number
    ][];
    const mergedHotelIndices = mergeClosePoints(
      hotelLatLngs,
      mapRef.current,
      70
    );
    const mergedHotels = hotels.filter((_, i) =>
      mergedHotelIndices.includes(i)
    );
    return mergedHotels;
  }, [hotels]);

  const debouncedDestFetch = useDebounceAsync(
    async ({ minLat, maxLat, minLng, maxLng }: MapBound) => {
      // skip fetch on initial map bound
      if ([minLat, maxLat, minLng, maxLng].every((v) => v === 0)) {
        return [];
      }
      const controller = new AbortController();
      try {
        const url = `/api/destination/bounds?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`;
        const res = await fetch(url, {
          signal: controller.signal,
        });
        const dests: Destination[] = await res.json();
        return dests;
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error(e);
        }
        return [];
      }
    },
    1500
  );

  async function handleOnIdle(ev: MapEvent<unknown>) {
    const bound = ev.map.getBounds();
    if (!bound) {
      return;
    }
    console.log(ev.map.getZoom());
    const ne = bound.getNorthEast();
    const sw = bound.getSouthWest();
    const [minLat, maxLat, minLng, maxLng] = [
      sw.lat(),
      ne.lat(),
      sw.lng(),
      ne.lng(),
    ];
    listingDispatch({
      type: 'SET_FILTER',
      payload: {
        latLngBounds: {
          maxLat,
          maxLng,
          minLat,
          minLng,
        },
      },
    });
    const dests = await debouncedDestFetch({
      minLat,
      maxLat,
      minLng,
      maxLng,
    });

    const destLatLngs = dests.map((d) => [d.lat, d.lng]) as [number, number][];
    const mergedDestIndices = mergeClosePoints(destLatLngs, ev.map, 180);
    const mergedDests = dests.filter((_, i) => mergedDestIndices.includes(i));

    console.log('mergedDests', mergedDests);
    setDestinations(mergedDests);
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className={styles.container}>
        <button
          className={styles.closeButton}
          onClick={() => setShowMap(false)}>
          Close Map <Close className={styles.closeIcon} />
        </button>
        <Map
          gestureHandling={'greedy'}
          defaultZoom={13}
          defaultCenter={center}
          fullscreenControl={false}
          mapId={MAP_ID}
          onIdle={(ev) => {
            handleOnIdle(ev);
            mapRef.current = ev.map;
          }}>
          {destinations.map((d) => (
            <DestinationMarker destination={d} key={`dest-marker-${d.id}`} />
          ))}
          {mergedHotels.map((h) => (
            <HotelMarker
              hotel={h}
              occupancy={occupancy}
              stayDates={stayDates}
              drawAttention={hoveredHotelId !== null && hoveredHotelId === h.id} // weird prop name
              key={`hotel-marker-${h.id}`}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}