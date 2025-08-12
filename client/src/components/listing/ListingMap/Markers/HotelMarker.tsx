import { useRef, useState } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import styles from './hotelmarker.module.css';
import type { Hotel } from '../../../../../../types/Hotel';
import type { Price } from '../../../../../../types/Price';
import MapListingCard from '../MapListingCard';
import type { OccupancyState } from '../../SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../../SearchBar/DateInput/DateInput';
import { useNavigate } from 'react-router-dom';

export default function HotelMarker({
  hotel,
  drawAttention,
  occupancy,
  stayDates,
}: {
  hotel: Hotel & Price;
  drawAttention: boolean;
  occupancy: OccupancyState;
  stayDates: StayDatesState;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  const navigate = useNavigate();
  const handleView = () => {
    // Build URL parameters for hotel detail page
    const params = new URLSearchParams();

    if (stayDates.checkinDate) {
      params.set('checkin', stayDates.checkinDate.toISOString().split('T')[0]);
    }
    if (stayDates.checkoutDate) {
      params.set(
        'checkout',
        stayDates.checkoutDate.toISOString().split('T')[0]
      );
    }
    params.set('adults', occupancy.adults.toString());
    params.set('children', occupancy.children.toString());
    params.set('rooms', occupancy.rooms.toString());
    // Get the destination ID from the current URL (should be passed down from parent)
    const currentDestId = new URLSearchParams(window.location.search).get(
      'destId'
    );
    if (currentDestId) {
      params.set('destination_id', JSON.parse(currentDestId));
    }

    navigate(`/hotel/${hotel.id}?${params.toString()}`);
  };

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleView}
        position={{ lat: hotel.latitude, lng: hotel.longitude }}
      >
        <div
          className={`${styles.hotelPriceBox} ${
            drawAttention ? styles.drawAttention : ''
          }`}
        >{`SGD ${hotel.price.toFixed(0)}`}</div>
      </AdvancedMarker>
      {isHovered && (
        <div>
          <InfoWindow
            anchor={markerRef.current}
            disableAutoPan={true}
            className={styles.infobox}
          >
            <div className={styles.cardContainer}>
              <MapListingCard
                setHoveredHotelId={() => {}}
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
