import { useRef, useState } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import styles from './hotelmarker.module.css';
import type { Hotel } from '../../../../../../types/Hotel';
import type { Price } from '../../../../../../types/Price';
import MapListingCard from '../MapListingCard';
import type { OccupancyState } from '../../SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../../SearchBar/DateInput/DateInput';

export default function HotelMarker({
  hotel,
  occupancy,
  stayDates,
}: {
  hotel: Hotel & Price;
  occupancy: OccupancyState;
  stayDates: StayDatesState;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        position={{ lat: hotel.latitude, lng: hotel.longitude }}>
        <div className={styles.hotelPriceBox}>{`SGD ${hotel.price.toFixed(
          0
        )}`}</div>
      </AdvancedMarker>
      {isHovered && (
        <div>
          <InfoWindow
            anchor={markerRef.current}
            disableAutoPan={true}
            className={styles.infobox}>
            <div className={styles.cardContainer}>
              <MapListingCard
                hotel={hotel}
                occupancy={occupancy}
                stayDates={stayDates}
              />
            </div>
          </InfoWindow>
        </div>
      )}
    </>
  );
}
