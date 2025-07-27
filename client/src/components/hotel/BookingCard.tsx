import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface BookingCardProps {
  price: number;
  rating: number;
  reviewCount: number;
  hotelName: string;
  hotelId?: string;
}

const BookingCard = ({ price, rating, reviewCount, hotelName, hotelId }: BookingCardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleReserveNow = () => {
    // Get current URL parameters
    const checkin = searchParams.get('checkin') || '2025-10-01';
    const checkout = searchParams.get('checkout') || '2025-10-07';
    const adults = searchParams.get('adults') || '2';
    const children = searchParams.get('children') || '0';
    const rooms = searchParams.get('rooms') || '1';
    const destinationId = searchParams.get('destination_id') || '';

    // Build booking URL with all necessary parameters
    const bookingParams = new URLSearchParams({
      hotelId: hotelId || '',
      checkin,
      checkout,
      adults,
      children,
      rooms,
      destination_id: destinationId,
      price: price.toString(),
      hotelName
    });

    // Navigate to booking page with all the data
    navigate(`/booking?${bookingParams.toString()}`);
  };

  return (
    <Card className="sticky top-6 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{hotelName}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.floor(rating) ? "fill-hotel-gold text-hotel-gold" : "text-muted-foreground"} 
                  />
                ))}
              </div>
              <span className="text-sm text-hotel-text-secondary">({reviewCount} reviews)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${price}</div>
            <div className="text-sm text-hotel-text-secondary">per night</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="checkin" className="text-sm font-medium">Check-in</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                id="checkin"
                type="date" 
                className="pl-9"
                value={searchParams.get('checkin') || '2025-10-01'}
                readOnly
              />
            </div>
          </div>
          <div>
            <Label htmlFor="checkout" className="text-sm font-medium">Check-out</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                id="checkout"
                type="date" 
                className="pl-9"
                value={searchParams.get('checkout') || '2025-10-07'}
                readOnly
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
          <Select value={`${searchParams.get('adults') || '2'}`} disabled>
            <SelectTrigger>
              <div className="flex items-center">
                <Users size={16} className="mr-2 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Guest</SelectItem>
              <SelectItem value="2">2 Guests</SelectItem>
              <SelectItem value="3">3 Guests</SelectItem>
              <SelectItem value="4">4 Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">3 nights</span>
            <span className="text-sm">${price * 3}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Taxes & fees</span>
            <span className="text-sm">$45</span>
          </div>
          <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>${(price * 3) + 45}</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          size="lg"
          onClick={handleReserveNow}
        >
          Reserve Now
        </Button>
        
        <p className="text-xs text-hotel-text-secondary text-center">
          Free cancellation until 24 hours before check-in
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingCard;