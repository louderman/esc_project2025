import { Button } from "@/components/hotel/ui/button";
import { Card, CardContent, CardHeader } from "@/components/hotel/ui/card";
import { Input } from "@/components/hotel/ui/input";
import { Label } from "@/components/hotel/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/hotel/ui/select";
import { Calendar, Users, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface AvailabilityInfo {
  requestedRooms: number;
  availableRooms: number;
  validRoomCount: number;
  requestedAdults: number;
  requestedChildren: number;
  totalRequestedGuests: number;
  maxGuestCapacity: number;
  validGuestCapacity: number;
  validAdults: number;
  validChildren: number;
}

interface BookingCardProps {
  price: number;
  rating: number;
  reviewCount: number;
  hotelName: string;
  hotelId?: string;
  hasRooms?: boolean;
  availability?: AvailabilityInfo;
}

const BookingCard = ({ price, rating, reviewCount, hotelName, hotelId, hasRooms = false, availability }: BookingCardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleReserveNow = () => {
    // Only allow booking if rooms are available
    if (!hasRooms) return;

    // Build URL parameters for hotel detail page
    const params = new URLSearchParams();
    
    if (searchParams.get('checkin')) {
      params.set('checkin', searchParams.get('checkin')!);
    }
    if (searchParams.get('checkout')) {
      params.set('checkout', searchParams.get('checkout')!);
    }
    params.set('adult', searchParams.get('adult') || '2');
    params.set('child', searchParams.get('child') || '0');
    params.set('room', searchParams.get('room') || '1');
    params.set('destId', searchParams.get('destId') || '');
    params.set('price', price.toString());
    params.set('hotelName', hotelName);
    params.set('hotelId', hotelId || '');
    
    navigate(`/booking?${params.toString()}`);
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
            {hasRooms && price > 0 ? (
              <>
                <div className="text-2xl font-bold">${price}</div>
                <div className="text-sm text-hotel-text-secondary">per night</div>
              </>
            ) : (
              <div className="text-sm text-hotel-text-secondary">No availability</div>
            )}
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
          <Label htmlFor="guests" className="text-sm font-medium">Guests & Rooms</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Adults: {availability?.validAdults || searchParams.get('adult') || '2'}</span>
              <span>Children: {availability?.validChildren || searchParams.get('child') || '0'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Total Guests: {(availability?.validAdults || parseInt(searchParams.get('adult') || '2')) + (availability?.validChildren || parseInt(searchParams.get('child') || '0'))}</span>
              <span>Rooms: {availability?.validRoomCount || searchParams.get('room') || '1'}</span>
            </div>
            
            {/* Show availability warnings */}
            {availability && (
              <div className="space-y-1">
                {availability.requestedRooms > availability.availableRooms && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Only {availability.availableRooms} room{availability.availableRooms !== 1 ? 's' : ''} available (requested {availability.requestedRooms})
                  </div>
                )}
                {availability.totalRequestedGuests > availability.maxGuestCapacity && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Maximum {availability.maxGuestCapacity} guest{availability.maxGuestCapacity !== 1 ? 's' : ''} allowed (requested {availability.totalRequestedGuests})
                  </div>
                )}
                {(availability.requestedAdults !== availability.validAdults || availability.requestedChildren !== availability.validChildren) && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    ℹ️ Guest count adjusted to fit room capacity
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {hasRooms && price > 0 ? (
          <>
            <div className="border-t pt-4">
              {(() => {
                const checkin = searchParams.get('checkin');
                const checkout = searchParams.get('checkout');
                const nights = checkin && checkout ? 
                  Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)) : 3;
                const rooms = availability?.validRoomCount || parseInt(searchParams.get('rooms') || '1');
                const totalPrice = price * nights * rooms;
                const taxes = Math.round(totalPrice * 0.1); // 10% taxes
                
                return (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">{nights} night{nights !== 1 ? 's' : ''} × {rooms} room{rooms !== 1 ? 's' : ''}</span>
                      <span className="text-sm">${totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Taxes & fees</span>
                      <span className="text-sm">${taxes}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${totalPrice + taxes}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              size="lg"
              onClick={handleReserveNow}
            >
              Reserve Now
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">No rooms available for selected dates</p>
            <Button 
              className="w-full bg-gray-400 cursor-not-allowed" 
              size="lg"
              disabled
            >
              No Availability
            </Button>
          </div>
        )}
        
        <p className="text-xs text-hotel-text-secondary text-center">
          Free cancellation until 24 hours before check-in
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingCard;