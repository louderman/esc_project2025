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
  Ban,
  Star,
  Camera,
  ShoppingBag,
  Plane,
  Bus,
  Shield,
  Phone,
  Scissors,
  Zap
} from "lucide-react";

interface HotelInfoProps {
  hotel: {
    description: string;
    address1: string;
    amenities: Record<string, boolean>;
  };
}

const HotelInfo = ({ hotel }: HotelInfoProps) => {
  // Extract attractions from hotel description
  const extractAttractionsFromDescription = (description: string) => {
    const attractions: string[] = [];
    
    // Common attraction keywords to look for with specific examples
    const attractionKeywords = [
      { keyword: 'disney', example: 'Disney World' },
      { keyword: 'universal', example: 'Universal Studios' },
      { keyword: 'seaworld', example: 'SeaWorld' },
      { keyword: 'orlando', example: 'Local Attractions' },
      { keyword: 'theme park', example: 'Theme Parks' },
      { keyword: 'amusement park', example: 'Amusement Parks' },
      { keyword: 'shopping', example: 'Shopping Centers' },
      { keyword: 'mall', example: 'Shopping Malls' },
      { keyword: 'outlet', example: 'Premium Outlets' },
      { keyword: 'restaurant', example: 'Fine Dining' },
      { keyword: 'dining', example: 'Restaurants' },
      { keyword: 'cafe', example: 'Cafes & Coffee Shops' },
      { keyword: 'airport', example: 'Local Airport' },
      { keyword: 'bus station', example: 'Bus Transportation' },
      { keyword: 'train station', example: 'Train Services' },
      { keyword: 'transportation', example: 'Public Transport' },
      { keyword: 'museum', example: 'Local Museums' },
      { keyword: 'gallery', example: 'Art Galleries' },
      { keyword: 'theater', example: 'Theaters & Shows' },
      { keyword: 'cinema', example: 'Movie Theaters' },
      { keyword: 'stadium', example: 'Sports Venues' },
      { keyword: 'arena', example: 'Event Arenas' },
      { keyword: 'beach', example: 'Beach Access' },
      { keyword: 'park', example: 'Public Parks' },
      { keyword: 'garden', example: 'Botanical Gardens' },
      { keyword: 'zoo', example: 'Wildlife Parks' },
      { keyword: 'aquarium', example: 'Aquariums' }
    ];
    
    const lowerDescription = description.toLowerCase();
    
    attractionKeywords.forEach(({ keyword, example }) => {
      if (lowerDescription.includes(keyword)) {
        if (!attractions.includes(example)) {
          attractions.push(example);
        }
      }
    });
    
    return attractions.slice(0, 6); // Limit to 6 attractions
  };

  const extractedAttractions = extractAttractionsFromDescription(hotel.description);

  const amenityIcons: Record<string, any> = {
    // Core amenities
    airConditioning: <Snowflake size={16} />,
    parkingGarage: <Car size={16} />,
    businessCenter: <CreditCard size={16} />,
    clothingIron: <Ban size={16} />, // Using Ban as placeholder for iron
    inHouseBar: <Coffee size={16} />,
    inHouseDining: <Utensils size={16} />,
    miniBarInRoom: <Coffee size={16} />,
    outdoorPool: <Waves size={16} />,
    roomService: <Utensils size={16} />,
    sauna: <Waves size={16} />, // Using Waves as placeholder for sauna
    tVInRoom: <Star size={16} />, // Using Star as placeholder for TV
    continentalBreakfast: <Coffee size={16} />,
    kitchen: <Utensils size={16} />,
    
    // Additional amenities that might be in the API
    wifi: <Wifi size={16} />,
    pool: <Waves size={16} />,
    indoorpool: <Waves size={16} />,
    gym: <Dumbbell size={16} />,
    breakfast: <Coffee size={16} />,
    parking: <Car size={16} />,
    restaurant: <Utensils size={16} />,
    spa: <Waves size={16} />,
    fitness: <Dumbbell size={16} />,
    laundry: <Ban size={16} />, // Using Ban as placeholder
    dryCleaning: <Scissors size={16} />,
    hairDryer: <Zap size={16} />,
    safe: <Shield size={16} />,
    voiceMail: <Phone size={16} />,
    videoCheckout: <CreditCard size={16} />,
    concierge: <CreditCard size={16} />,
    shuttle: <Car size={16} />,
    elevator: <Ban size={16} />, // Using Ban as placeholder
    accessible: <Ban size={16} />, // Using Ban as placeholder
    petFriendly: <Ban size={16} />, // Using Ban as placeholder
    smoking: <Ban size={16} />, // Using Ban as placeholder
    nonSmoking: <Ban size={16} />, // Using Ban as placeholder
  };

  const amenityLabels: Record<string, string> = {
    // Core amenities
    airConditioning: "Air Conditioning",
    parkingGarage: "Free Parking",
    businessCenter: "Business Center",
    clothingIron: "Iron Available",
    inHouseBar: "In-House Bar",
    inHouseDining: "In-House Dining",
    miniBarInRoom: "Mini Bar",
    outdoorPool: "Outdoor Pool",
    roomService: "Room Service",
    sauna: "Sauna",
    tVInRoom: "TV in Room",
    continentalBreakfast: "Continental Breakfast",
    kitchen: "Kitchen",
    
    // Additional amenities
    wifi: "Free WiFi",
    pool: "Swimming Pool",
    indoorpool: "Indoor Pool",
    gym: "Fitness Center",
    breakfast: "Breakfast Included",
    parking: "Free Parking",
    restaurant: "Restaurant",
    spa: "Spa Services",
    fitness: "Fitness Center",
    laundry: "Laundry Service",
    dryCleaning: "Dry Cleaning",
    hairDryer: "Hair Dryer",
    safe: "In-Room Safe",
    voiceMail: "Voice Mail",
    videoCheckout: "Video Checkout",
    concierge: "Concierge Service",
    shuttle: "Shuttle Service",
    elevator: "Elevator",
    accessible: "Accessible Rooms",
    petFriendly: "Pet Friendly",
    smoking: "Smoking Allowed",
    nonSmoking: "Non-Smoking",
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
          <div 
            className="text-hotel-text-secondary leading-relaxed mb-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: hotel.description }}
          />
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

      {/* Nearby Attractions from Hotel Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin size={20} />
            <span>Nearby Attractions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {extractedAttractions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-lg flex items-center space-x-2">
                  <Star size={18} className="text-hotel-gold" />
                  <span>Attractions Mentioned</span>
                </h4>
                <div className="space-y-2">
                  {extractedAttractions.slice(0, 3).map((attraction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-hotel-gold" />
                        <span className="text-sm font-medium">{attraction}</span>
                      </div>
                      <span className="text-xs text-hotel-text-secondary">Nearby</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-lg flex items-center space-x-2">
                  <ShoppingBag size={18} className="text-hotel-gold" />
                  <span>More Attractions</span>
                </h4>
                <div className="space-y-2">
                  {extractedAttractions.slice(3, 6).map((attraction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Camera size={14} className="text-hotel-gold" />
                        <span className="text-sm font-medium">{attraction}</span>
                      </div>
                      <span className="text-xs text-hotel-text-secondary">Nearby</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-hotel-text-secondary">No specific attractions mentioned in hotel description</p>
              <p className="text-sm text-hotel-text-secondary mt-2">Check the hotel overview above for more details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelInfo;