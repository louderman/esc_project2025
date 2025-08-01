import { useMemo, useRef, useState } from 'react';
import type { Destination } from '../../../../../../types/Destination';
import { AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import styles from './destinationmarker.module.css';

export default function DestinationMarker({
  destination,
}: {
  destination: Destination;
}) {
  const glyph = useMemo(() => {
    const img = document.createElement('img');
    img.src = '/listing/map/dest_glyph_icon.svg';
    img.alt = 'dest';
    img.width = 16;
    return img;
  }, []);

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
        position={{ lat: destination.lat, lng: destination.lng }}
      >
        <Pin glyph={glyph} background={'#fd4747'} />
      </AdvancedMarker>
      {isHovered && (
        <div className={styles.infoboxWrapper}>
          <InfoWindow
            anchor={markerRef.current}
            disableAutoPan={true}
            className={styles.infobox}
          >
            <span className={styles.destTitle}>{destination.term}</span>
          </InfoWindow>
        </div>
      )}
    </>
  );
}
