import { useRef, useState } from 'react';
import { AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import styles from './hotelmarker.module.css';
import type { Hotel } from '../../../../../../types/Hotel';
import type { Price } from '../../../../../../types/Price';

export default function HotelMarker({ hotel }: { hotel: Hotel & Price }) {
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
        position={{ lat: hotel.latitude, lng: hotel.longitude }}
      >
        <Pin background={'#ff7373'} glyphColor={'#c03535ff'} />
      </AdvancedMarker>
      {isHovered && (
        <div>
          <InfoWindow
            anchor={markerRef.current}
            disableAutoPan={true}
            className={styles.infobox}
          >
            <span className={styles.hotelTitle}>{hotel.name}</span>
          </InfoWindow>
        </div>
      )}
    </>
  );
}
