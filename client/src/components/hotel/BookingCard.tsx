import { Button } from "@/components/hotel/ui/button";
import { Card, CardContent, CardHeader } from "@/components/hotel/ui/card";
import { Label } from "@/components/hotel/ui/label";
import { Users, Star, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Calendar from "@/components/listing/SearchBar/DateInput/Calendar/Calendar";
import type { StayDatesState } from "@/components/listing/SearchBar/DateInput/DateInput";

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
  const [showCheckinCal, setShowCheckinCal] = useState(false);
  const [showCheckoutCal, setShowCheckoutCal] = useState(false);
  
  // Parse dates from URL parameters
  const checkinDate = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
  const checkoutDate = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
  
  // Create stayDates state that persists across renders
  const [stayDates, setStayDatesState] = useState<StayDatesState>({
    checkinDate: new Date(checkinDate),
    checkoutDate: new Date(checkoutDate)
  });
  
  // Update stayDates when URL parameters change
  useEffect(() => {
    const newCheckinDate = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
    const newCheckoutDate = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
    
    setStayDatesState({
      checkinDate: new Date(newCheckinDate),
      checkoutDate: new Date(newCheckoutDate)
    });
  }, [searchParams]);
  
  const setStayDates = (newDates: StayDatesState | ((prev: StayDatesState) => StayDatesState)) => {
    const dates = typeof newDates === 'function' ? newDates(stayDates) : newDates;
    
    if (dates.checkinDate && dates.checkoutDate) {
      // Update the local state first
      setStayDatesState(dates);
      
      // Then update the URL and refresh the page
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('checkin', dates.checkinDate.toISOString().split('T')[0]);
      currentUrl.searchParams.set('checkout', dates.checkoutDate.toISOString().split('T')[0]);
      window.location.href = currentUrl.toString();
    }
  };
  
  const calWrapperRef = useRef<HTMLDivElement>(null);
  const checkinButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (
        !calWrapperRef.current?.contains(ev.target as Node) &&
        !checkinButtonRef.current?.contains(ev.target as Node) &&
        !checkoutButtonRef.current?.contains(ev.target as Node)
      ) {
        setShowCheckinCal(false);
        setShowCheckoutCal(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReserveNow = () => {
    // Only allow booking if rooms are available
    if (!hasRooms) return;

    // Calculate number of nights
    const checkin = searchParams.get('checkin')?.replace(/"/g, '') || searchParams.get('checkin');
    const checkout = searchParams.get('checkout')?.replace(/"/g, '') || searchParams.get('checkout');
    const numberOfNights = checkin && checkout ? 
      Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)) : 1;

    // Get guest information
    const adults = parseInt(searchParams.get('adults') || searchParams.get('adult') || '2');
    const children = parseInt(searchParams.get('children') || searchParams.get('child') || '0');
    const rooms = parseInt(searchParams.get('rooms') || searchParams.get('room') || '1');

    // Calculate total amount (price is already the total)
    const totalAmount = price;

    // Prepare booking details
    const bookingDetails = {
      selectedRoom: {
        id: hotelId || 'default',
        room_type: 'Standard Room',
        price: price / numberOfNights, // Price per night
        totalPrice: price, // Total price for the stay
        free_cancellation: true,
        occupancy: adults + children,
        bed_type: 'King bed',
        size: '35',
        description: 'Standard room with modern amenities',
        amenities: ['WiFi', 'TV', 'Air Conditioning']
      },
      numberOfGuests: {
        adults: adults,
        children: children,
        total: adults + children
      },
      numberOfNights: numberOfNights,
      numberOfRooms: rooms,
      checkinDate: checkin,
      checkoutDate: checkout,
              totalAmount: totalAmount,
        pricePerNight: price / numberOfNights
    };

    // Navigate to booking page with state
    navigate('/booking', {
      state: {
        bookingDetails,
        hotel: {
          id: hotelId,
          name: hotelName,
          rating: rating,
          reviewCount: reviewCount,
          price: price
        },
        totalAmount: totalAmount,
      },
    });
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-white">
      <CardHeader className="pb-6 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{hotelName}</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.floor(rating) ? "fill-hotel-gold text-hotel-gold" : "text-muted-foreground"} 
                    />
                  ))}
                  <span className="ml-2 text-lg font-semibold">{rating}</span>
                </div>
                <span className="text-lg text-hotel-text-secondary">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            {hasRooms && price > 0 ? (
              <>
                <div className="text-3xl font-bold text-orange-500">${price}</div>
                <div className="text-base text-hotel-text-secondary">total</div>
              </>
            ) : (
              <div className="text-lg text-hotel-text-secondary">No availability</div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="checkin" className="text-sm font-medium">Check-in</Label>
            <div className="relative">
              <CalendarIcon 
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 cursor-pointer"
                onClick={() => setShowCheckinCal(!showCheckinCal)}
              />
              <button
                ref={checkinButtonRef}
                onClick={() => setShowCheckinCal(!showCheckinCal)}
                className="w-full text-left pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {checkinDate}
              </button>
              {showCheckinCal && (
                <div className="absolute top-full left-0 z-20 mt-1" ref={calWrapperRef}>
                  <Calendar stayDates={stayDates} setStayDates={setStayDates} />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="checkout" className="text-sm font-medium">Check-out</Label>
            <div className="relative">
              <CalendarIcon 
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 cursor-pointer"
                onClick={() => setShowCheckoutCal(!showCheckoutCal)}
              />
              <button
                ref={checkoutButtonRef}
                onClick={() => setShowCheckoutCal(!showCheckoutCal)}
                className="w-full text-left pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {checkoutDate}
              </button>
              {showCheckoutCal && (
                <div className="absolute top-full left-0 z-20 mt-1" ref={calWrapperRef}>
                  <Calendar stayDates={stayDates} setStayDates={setStayDates} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="guests" className="text-sm font-medium">Guests & Rooms</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Adults: {searchParams.get('adults') || searchParams.get('adult') || '2'}</span>
              <span>Children: {searchParams.get('children') || searchParams.get('child') || '0'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Total Guests: {parseInt(searchParams.get('adults') || searchParams.get('adult') || '2') + parseInt(searchParams.get('children') || searchParams.get('child') || '0')}</span>
              <span>Rooms: {searchParams.get('rooms') || searchParams.get('room') || '1'}</span>
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
                const rooms = parseInt(searchParams.get('rooms') || searchParams.get('room') || '1');
                const pricePerNight = price / nights; // Calculate per-night rate from total
                const totalPrice = price; // Price is already the total
                const taxes = Math.round(totalPrice * 0.1); // 10% taxes
                
                return (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">{nights} night{nights !== 1 ? 's' : ''} × {rooms} room{rooms !== 1 ? 's' : ''} × ${pricePerNight.toFixed(0)}/night</span>
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-lg" 
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