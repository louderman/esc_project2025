import { Card, CardContent, CardHeader, CardTitle } from "@/components/hotel/ui/card";
import { Badge } from "@/components/hotel/ui/badge";
import { 
  Wifi, 
  Car, 
  Utensils, 
  Dumbbell, 
  Waves, 
  Coffee, 
  Snowflake, 
  MapPin,
  Clock,
  CreditCard,
  Ban
} from "lucide-react";

interface HotelInfoProps {
  hotel: {
    description: string;
    address1: string;
    amenities: Record<string, boolean>;
  };
}

const HotelInfo = ({ hotel }: HotelInfoProps) => {
  const amenityIcons: Record<string, JSX.Element> = {
    wifi: <Wifi size={16} />,
    airConditioning: <Snowflake size={16} />,
    pool: <Waves size={16} />,
    gym: <Dumbbell size={16} />,
    breakfast: <Coffee size={16} />,
    parking: <Car size={16} />,
    restaurant: <Utensils size={16} />
  };

  const amenityLabels: Record<string, string> = {
    wifi: "Free WiFi",
    airConditioning: "Air Conditioning", 
    pool: "Swimming Pool",
    gym: "Fitness Center",
    breakfast: "Breakfast Included",
    parking: "Free Parking",
    restaurant: "Restaurant"
  };

  return (
    <div className="space-y-6">
      {/* Hotel Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Hotel Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-hotel-text-secondary leading-relaxed mb-4">
            {hotel.description}
          </p>
          <div className="flex items-start space-x-2 text-sm">
            <MapPin size={16} className="text-hotel-text-secondary mt-0.5 flex-shrink-0" />
            <span className="text-hotel-text-secondary">{hotel.address1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Facilities */}
      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(hotel.amenities)
              .filter(([_, available]) => available)
              .map(([amenity]) => (
                <div key={amenity} className="flex items-center space-x-2 text-sm">
                  {amenityIcons[amenity] || <Coffee size={16} />}
                  <span>{amenityLabels[amenity] || amenity}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <Clock size={16} />
              <span>Check-in/Check-out</span>
            </h4>
            <div className="text-sm text-hotel-text-secondary space-y-1">
              <p>Check-in: 3:00 PM - 11:00 PM</p>
              <p>Check-out: Until 11:00 AM</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <CreditCard size={16} />
              <span>Payment</span>
            </h4>
            <div className="text-sm text-hotel-text-secondary">
              <p>Credit cards accepted: Visa, Mastercard, American Express</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <Ban size={16} />
              <span>Cancellation</span>
            </h4>
            <div className="text-sm text-hotel-text-secondary">
              <p>Free cancellation until 24 hours before check-in</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelInfo;