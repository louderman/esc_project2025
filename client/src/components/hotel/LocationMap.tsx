import { Card, CardContent, CardHeader, CardTitle } from "@/components/hotel/ui/card";
import { MapPin } from "lucide-react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useRef } from 'react';

const API_KEY = 'AIzaSyBta33S3S8OPr_m0uL-TNn3UTW8MSVF-L8';
const MAP_ID = 'a8079e059f31bc15534a6a3a';

interface LocationMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  hotelName: string;
}

const LocationMap = ({ address, latitude, longitude, hotelName }: LocationMapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin size={20} />
          <span>Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
                      <p className="text-hotel-text-secondary">{address}</p>
            
            {/* Real Google Maps integration */}
            {latitude && longitude ? (
              <div className="aspect-[16/9] rounded-lg overflow-hidden border border-hotel-border-light">
                <APIProvider apiKey={API_KEY}>
                  <Map
                    mapId={MAP_ID}
                    center={{ lat: latitude, lng: longitude }}
                    zoom={15}
                    className="w-full h-full"
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    mapTypeControl={true}
                    streetViewControl={true}
                    fullscreenControl={true}
                    zoomControl={true}
                    clickableIcons={true}
                    draggable={true}
                    scrollwheel={true}
                    tilt={0}
                  >
                    <Marker
                      position={{ lat: latitude, lng: longitude }}
                      title={hotelName}
                    />
                  </Map>
                </APIProvider>
              </div>
            ) : (
              <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>
                <div className="relative z-10 text-center">
                  <MapPin size={32} className="mx-auto mb-2 text-primary" />
                  <p className="text-sm text-hotel-text-secondary">Location coordinates not available</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-hotel-text-secondary">
                <p>Distance from city center: 2.5 km</p>
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;