<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/hotel/ui/card";
>>>>>>> origin/main
import { MapPin, Navigation } from "lucide-react";

interface LocationMapProps {
  address: string;
}

const LocationMap = ({ address }: LocationMapProps) => {
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
          
          {/* Placeholder map - in a real app, you'd integrate with Google Maps or similar */}
          <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>
            <div className="relative z-10 text-center">
              <MapPin size={32} className="mx-auto mb-2 text-primary" />
              <p className="text-sm text-hotel-text-secondary">Interactive map would be here</p>
            </div>
            
            {/* Mock location pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-hotel-text-secondary">
              <p>Distance from city center: 2.5 km</p>
            </div>
            <div className="flex items-center space-x-1 text-primary text-sm font-medium cursor-pointer hover:underline">
              <Navigation size={14} />
              <span>Get Directions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;