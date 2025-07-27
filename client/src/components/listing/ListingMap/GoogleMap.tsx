import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import styles from './googlemap.module.css';
import { useEffect, useMemo, useRef, useState } from 'react';

const API_KEY = 'AIzaSyBta33S3S8OPr_m0uL-TNn3UTW8MSVF-L8';
const MAP_ID = 'a8079e059f31bc15534a6a3a';

// Reference: https://www.youtube.com/watch?v=PfZ4oLftItk&ab_channel=GoogleMapsPlatform
export default function GoogleMap() {
  const center = {
    lat: 1.3521,
    lng: 103.8198,
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className={styles.container}>
        <Map
          gestureHandling={'greedy'}
          defaultZoom={9}
          defaultCenter={center}
          mapId={MAP_ID}
        >
          <AdvancedMarker position={center}>
            <div>HERERERERERERERERERE</div>
          </AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
}
