import { Button } from "@/components/hotel/ui/button";
import { Card, CardContent, CardHeader } from "@/components/hotel/ui/card";
import { Label } from "@/components/hotel/ui/label";
import { getImageWithFallback } from "@/utils/imageFallbacks";
import { Calendar as CalendarIcon, MapPin, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Calendar, { type StayDatesState } from "./Calendar";

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

interface Room {
  id: string;
  room_type: string;
  price: number;
  free_cancellation: boolean;
  image: string;
  occupancy?: number;
  bed_type?: string;
  size?: string;
  description?: string;
  long_description?: string;
  amenities?: string[];
  key?: string;
}

interface BookingCardProps {
  price: number;
  rating: number;
  reviewCount: number;
  hotelName: string;
  hotelId?: string;
  hotelAddress?: string;
  hasRooms?: boolean;
  availability?: AvailabilityInfo;
  selectedRoom?: Room | null;
  hotelImages?: string[];
}

const BookingCard = ({ 
  price, 
  rating, 
  reviewCount, 
  hotelName, 
  hotelId, 
  hotelAddress,
  hasRooms = false, 
  availability, 
  selectedRoom,
  hotelImages = []
}: BookingCardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCheckinCal, setShowCheckinCal] = useState(false);
  const [showCheckoutCal, setShowCheckoutCal] = useState(false);
  const calWrapperRef = useRef<HTMLDivElement>(null);
  const checkinButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);
  
  // Error states
  const [dateErrors, setDateErrors] = useState<{
    checkin?: string;
    checkout?: string;
    general?: string;
  }>({});
  
  // Store original dates (the dates user had when they first entered the page)
  const [originalDates, setOriginalDates] = useState<StayDatesState | null>(null);
  
  // Parse dates from URL parameters with proper fallbacks and error handling
  const getDateFromParams = (paramName: string, fallback: string) => {
    try {
      const param = searchParams.get(paramName)?.replace(/"/g, '');
      if (param && param.trim() !== '') {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(param)) {
          console.warn(`Invalid date format for ${paramName}:`, param);
          return fallback;
        }
        
        // Parse date in local timezone to avoid offset issues
        const [year, month, day] = param.split('-').map(Number);
        
        // Validate date components
        if (!year || !month || !day || 
            year < 1900 || year > 2100 || 
            month < 1 || month > 12 || 
            day < 1 || day > 31) {
          console.warn(`Invalid date components for ${paramName}:`, { year, month, day });
          return fallback;
        }
        
        const date = new Date(year, month - 1, day); // month is 0-indexed
        
        // Check if the date is valid and not in the past
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date for ${paramName}:`, param);
          return fallback;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          console.warn(`Past date for ${paramName}:`, param);
          return fallback;
        }
        
        return param;
      }
    } catch (error) {
      console.error(`Error parsing date for ${paramName}:`, error);
    }
    return fallback;
  };
  
  const checkinDate = getDateFromParams('checkin', '2025-08-12');
  const checkoutDate = getDateFromParams('checkout', '2025-08-30');

  // Helper function to format date for display from Date object with error handling
  const formatDateFromDate = (date: Date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Select date';
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date from Date object:', error);
      return 'Select date';
    }
  };

  // Helper function to create local date with error handling
  const createLocalDate = (dateString: string): Date => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Validate date components
      if (!year || !month || !day || 
          year < 1900 || year > 2100 || 
          month < 1 || month > 12 || 
          day < 1 || day > 31) {
        throw new Error(`Invalid date components: ${year}-${month}-${day}`);
      }
      
      const date = new Date(year, month - 1, day); // month is 0-indexed
      
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateString}`);
      }
      
      return date;
    } catch (error) {
      console.error('Error creating local date:', error);
      // Return a fallback date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  };

  // Validate date range
  const validateDateRange = (checkin: Date, checkout: Date): { isValid: boolean; error?: string } => {
    try {
      // Check if dates are valid
      if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
        return { isValid: false, error: 'Invalid dates selected' };
      }
      
      // Check if checkout is after checkin
      if (checkout <= checkin) {
        return { isValid: false, error: 'Check-out date must be after check-in date' };
      }
      
      // Check if dates are in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkin < today) {
        return { isValid: false, error: 'Check-in date cannot be in the past' };
      }
      
      if (checkout < today) {
        return { isValid: false, error: 'Check-out date cannot be in the past' };
      }
      

      
      return { isValid: true };
    } catch (error) {
      console.error('Error validating date range:', error);
      return { isValid: false, error: 'Error validating dates' };
    }
  };
  
  // Create stayDates state that persists across renders
  const [stayDates, setStayDatesState] = useState<StayDatesState>(() => {
    try {
      const checkin = createLocalDate(checkinDate);
      const checkout = createLocalDate(checkoutDate);
      
      // Validate the initial date range
      const validation = validateDateRange(checkin, checkout);
      if (!validation.isValid) {
        console.warn('Initial date range validation failed:', validation.error);
        // Use fallback dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
        
        return {
          checkinDate: tomorrow,
          checkoutDate: dayAfterTomorrow
        };
      }
      
      return {
        checkinDate: checkin,
        checkoutDate: checkout
      };
    } catch (error) {
      console.error('Error creating initial stayDates:', error);
      // Use fallback dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        checkinDate: tomorrow,
        checkoutDate: dayAfterTomorrow
      };
    }
  });

  // Add state for temporary dates (not yet saved to URL)
  const [tempDates, setTempDates] = useState<StayDatesState>(() => {
    try {
      const checkin = createLocalDate(checkinDate);
      const checkout = createLocalDate(checkoutDate);
      
      // Validate the initial date range
      const validation = validateDateRange(checkin, checkout);
      if (!validation.isValid) {
        console.warn('Initial temp date range validation failed:', validation.error);
        // Use fallback dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
        
        return {
          checkinDate: tomorrow,
          checkoutDate: dayAfterTomorrow
        };
      }
      
      return {
        checkinDate: checkin,
        checkoutDate: checkout
      };
    } catch (error) {
      console.error('Error creating initial tempDates:', error);
      // Use fallback dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        checkinDate: tomorrow,
        checkoutDate: dayAfterTomorrow
      };
    }
  });
  
  // Function to reset dates to original values
  const resetToOriginalDates = () => {
    try {
      if (originalDates) {
        console.log('Resetting to original dates:', originalDates);
        setTempDates(originalDates);
        setDateErrors({}); // Clear any errors
        setShowCheckinCal(false);
        setShowCheckoutCal(false);
      } else {
        console.warn('No original dates available for reset');
      }
    } catch (error) {
      console.error('Error resetting to original dates:', error);
    }
  };
  
  // Initialize original dates on first load
  useEffect(() => {
    if (!originalDates) {
      try {
        const checkin = createLocalDate(checkinDate);
        const checkout = createLocalDate(checkoutDate);
        
        // Validate the initial date range
        const validation = validateDateRange(checkin, checkout);
        if (!validation.isValid) {
          console.warn('Initial date range validation failed for original dates:', validation.error);
          // Use fallback dates
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dayAfterTomorrow = new Date();
          dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
          
          setOriginalDates({
            checkinDate: tomorrow,
            checkoutDate: dayAfterTomorrow
          });
        } else {
          setOriginalDates({
            checkinDate: checkin,
            checkoutDate: checkout
          });
        }
      } catch (error) {
        console.error('Error creating original dates:', error);
        // Use fallback dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
        
        setOriginalDates({
          checkinDate: tomorrow,
          checkoutDate: dayAfterTomorrow
        });
      }
    }
  }, [originalDates, checkinDate, checkoutDate]);
  
  // Update stayDates when URL parameters change
  useEffect(() => {
    try {
      const newCheckinDate = getDateFromParams('checkin', '2025-08-12');
      const newCheckoutDate = getDateFromParams('checkout', '2025-08-30');
      
      const checkin = createLocalDate(newCheckinDate);
      const checkout = createLocalDate(newCheckoutDate);
      
      // Validate the date range
      const validation = validateDateRange(checkin, checkout);
      if (!validation.isValid) {
        console.warn('Date range validation failed:', validation.error);
        setDateErrors({ general: validation.error });
        return;
      }
      
      // Clear any existing errors
      setDateErrors({});
      
      const newDates = {
        checkinDate: checkin,
        checkoutDate: checkout
      };
      
      setStayDatesState(newDates);
      setTempDates(newDates);
      setOriginalDates(newDates); // Store original dates
    } catch (error) {
      console.error('Error updating stay dates:', error);
      setDateErrors({ general: 'Error updating dates' });
      // Use fallback dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
      
      const fallbackDates = {
        checkinDate: tomorrow,
        checkoutDate: dayAfterTomorrow
      };
      setStayDatesState(fallbackDates);
      setTempDates(fallbackDates);
      setOriginalDates(fallbackDates); // Store original dates
    }
  }, [searchParams]);
  
  const setStayDates = (newDates: StayDatesState | ((prev: StayDatesState) => StayDatesState)) => {
    try {
      const dates = typeof newDates === 'function' ? newDates(tempDates) : newDates;
      
      // Validate the new date range
      const validation = validateDateRange(dates.checkinDate, dates.checkoutDate);
      if (!validation.isValid) {
        console.warn('Date range validation failed:', validation.error);
        setDateErrors({ general: validation.error });
        return;
      }
      
      // Clear any existing errors
      setDateErrors({});
      
      // Only update the temporary dates, don't update URL yet
      setTempDates(dates);
      
      // Close calendar dropdowns
      setShowCheckinCal(false);
      setShowCheckoutCal(false);
      
      console.log('Temporary dates updated:', dates);
    } catch (error) {
      console.error('Error setting stay dates:', error);
      setDateErrors({ general: 'Error setting dates' });
    }
  };

  // New function to handle refresh bookings
  const handleRefreshBookings = () => {
    try {
      if (!tempDates.checkinDate || !tempDates.checkoutDate) {
        setDateErrors({ general: 'Please select both check-in and check-out dates' });
        return;
      }
      
      // Validate the date range before refreshing
      const validation = validateDateRange(tempDates.checkinDate, tempDates.checkoutDate);
      if (!validation.isValid) {
        setDateErrors({ general: validation.error });
        return;
      }
      
      // Format dates for URL - fix timezone offset issue
      const formatDateForUrl = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const newCheckin = formatDateForUrl(tempDates.checkinDate);
      const newCheckout = formatDateForUrl(tempDates.checkoutDate);
      
      // Check if dates are different from current URL dates
      const currentCheckin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-08-12';
      const currentCheckout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-08-30';
      
      if (newCheckin !== currentCheckin || newCheckout !== currentCheckout) {
        // Clear any existing errors
        setDateErrors({});
        
        // Update URL parameters
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('checkin', newCheckin);
        currentUrl.searchParams.set('checkout', newCheckout);
        
        // Use history API to update URL
        window.history.pushState({}, '', currentUrl.toString());
        
        console.log('Refreshing bookings with new dates:', { checkin: newCheckin, checkout: newCheckout });
        
        // Refresh the page to get updated data
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.log('Dates unchanged, no refresh needed');
      }
    } catch (error) {
      console.error('Error refreshing bookings:', error);
      setDateErrors({ general: 'Error refreshing bookings' });
    }
  };

  // Check if refresh button should be enabled
  const shouldEnableRefresh = () => {
    if (!tempDates.checkinDate || !tempDates.checkoutDate) return false;
    
    const formatDateForUrl = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const newCheckin = formatDateForUrl(tempDates.checkinDate);
    const newCheckout = formatDateForUrl(tempDates.checkoutDate);
    const currentCheckin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-08-12';
    const currentCheckout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-08-30';
    
    return newCheckin !== currentCheckin || newCheckout !== currentCheckout;
  };

  // Handle click outside to close calendars
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

    // Get hotel image from hotel images array, selected room, or use fallback
    const hotelImage = getImageWithFallback(
      hotelImages.length > 0 ? hotelImages[0] : selectedRoom?.image,
      'hotel'
    );

    // Prepare booking details - ensure consistent data structure
    const bookingDetails = {
      selectedRoom: selectedRoom ? {
        id: selectedRoom.id,
        room_type: selectedRoom.room_type, // Use room_type consistently
        roomType: selectedRoom.room_type, // Also provide roomType for backward compatibility
        price: price / numberOfNights, // Price per night
        totalPrice: price, // Total price for the stay
        free_cancellation: selectedRoom.free_cancellation,
        occupancy: selectedRoom.occupancy || adults + children,
        bed_type: selectedRoom.bed_type || 'King bed',
        size: selectedRoom.size || '35',
        description: selectedRoom.description || 'Standard room with modern amenities',
        amenities: selectedRoom.amenities || ['WiFi', 'TV', 'Air Conditioning'],
        image: selectedRoom.image // Add the image property from selectedRoom
      } : {
        id: hotelId || 'default',
        room_type: 'Standard Room', // Use room_type consistently
        roomType: 'Standard Room', // Also provide roomType for backward compatibility
        price: price / numberOfNights, // Price per night
        totalPrice: price, // Total price for the stay
        free_cancellation: true,
        occupancy: adults + children,
        bed_type: 'King bed',
        size: '35',
        description: 'Standard room with modern amenities',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        image: hotelImage // Add fallback image for default room
      },
      numberOfGuests: {
        adults: adults,
        children: children,
        total: adults + children
      },
      numberOfNights: numberOfNights,
      numberOfRooms: rooms,
      // Keep dates in YYYY-MM-DD format (no conversion needed)
      checkinDate: checkin,
      checkoutDate: checkout,
      totalAmount: totalAmount,
      pricePerNight: price / numberOfNights,
      hotelImage: hotelImage, // Single hotel image for backward compatibility
      hotelImages: hotelImages // Array of hotel images
    };

    // Navigate to booking page with state
    navigate('/booking', {
      state: {
        bookingDetails: {
          ...bookingDetails,
          hotelImages: hotelImages // Add hotel images array to booking details
        },
        hotel: {
          id: hotelId,
          name: hotelName,
          address: hotelAddress,
          rating: rating,
          reviewCount: reviewCount,
          price: price,
          image: hotelImage // Add image to hotel object
        },
        totalAmount: totalAmount,
      },
    });
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-white rounded-xl overflow-hidden" data-cy="booking-card">
      <CardHeader className="pb-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
                         <div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2" data-cy="hotel-name">{hotelName}</h3>
              {hotelAddress && (
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {hotelAddress}
                </p>
              )}
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
                 <div className="text-3xl font-bold text-orange-500" data-cy="room-price">${price.toFixed(2)}</div>
                <div className="text-base text-hotel-text-secondary">total</div>
                {selectedRoom && (
                  <div className="text-sm text-hotel-text-secondary mt-1">
                    Selected: {selectedRoom.room_type}
                  </div>
                )}
              </>
            ) : (
              <div className="text-lg text-hotel-text-secondary">No availability</div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Date Selection Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarIcon size={20} className="mr-2 text-orange-500" />
            Select Your Dates
          </h4>
          
          {/* Error Display */}
          {dateErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">
                    {dateErrors.general}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkin" className="text-sm font-medium text-gray-700">Check-in Date</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <CalendarIcon 
                    size={18}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  />
                </div>
                <button
                  ref={checkinButtonRef}
                  onClick={() => setShowCheckinCal(!showCheckinCal)}
                  className={`w-full text-left pl-12 pr-4 py-3 border-2 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm ${
                    dateErrors.checkin ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{formatDateFromDate(tempDates.checkinDate)}</div>
                  <div className="text-sm text-gray-500">Check-in</div>
                </button>
                {showCheckinCal && (
                  <div className="absolute top-full left-0 z-50 mt-2 shadow-2xl rounded-xl border border-gray-200 bg-white transform -translate-x-0 sm:left-0" ref={calWrapperRef}>
                    <Calendar stayDates={tempDates} setStayDates={setStayDates} mode="checkin" onReset={resetToOriginalDates} />
                  </div>
                )}
              </div>
              {dateErrors.checkin && (
                <p className="text-xs text-red-600 mt-1">{dateErrors.checkin}</p>
              )}
            </div>
            
            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="checkout" className="text-sm font-medium text-gray-700">Check-out Date</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <CalendarIcon 
                    size={18}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  />
                </div>
                <button
                  ref={checkoutButtonRef}
                  onClick={() => setShowCheckoutCal(!showCheckoutCal)}
                  className={`w-full text-left pl-12 pr-4 py-3 border-2 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm ${
                    dateErrors.checkout ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{formatDateFromDate(tempDates.checkoutDate)}</div>
                  <div className="text-sm text-gray-500">Check-out</div>
                </button>
                {showCheckoutCal && (
                  <div className="absolute top-full left-0 z-50 mt-2 shadow-2xl rounded-xl border border-gray-200 bg-white transform -translate-x-0 sm:left-0" ref={calWrapperRef}>
                    <Calendar stayDates={tempDates} setStayDates={setStayDates} mode="checkout" onReset={resetToOriginalDates} />
                  </div>
                )}
              </div>
              {dateErrors.checkout && (
                <p className="text-xs text-red-600 mt-1">{dateErrors.checkout}</p>
              )}
            </div>
          </div>
          
          {/* Refresh Bookings Button */}
          <div className="flex justify-center pt-4 space-x-4">
            {/* Reset to Original Dates Button */}
            {originalDates && (
              <Button
                onClick={resetToOriginalDates}
                variant="outline"
                className="font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                🔄 Reset to Original
              </Button>
            )}
            
            {/* Refresh Bookings Button */}
            <Button
              onClick={handleRefreshBookings}
              className={`font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${
                shouldEnableRefresh() && !dateErrors.general
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!shouldEnableRefresh() || !!dateErrors.general}
            >
              {dateErrors.general ? '⚠️ Fix Date Errors' : shouldEnableRefresh() ? '🔄 Refresh Bookings' : '✓ Dates Up to Date'}
            </Button>
          </div>
        </div>
        
        {/* Guests & Rooms Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users size={20} className="mr-2 text-orange-500" />
            Guests & Rooms
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Adults:</span>
              <span className="text-gray-700">{searchParams.get('adults') || searchParams.get('adult') || '2'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Children:</span>
              <span className="text-gray-700">{searchParams.get('children') || searchParams.get('child') || '0'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total Guests:</span>
              <span className="text-gray-700">{parseInt(searchParams.get('adults') || searchParams.get('adult') || '2') + parseInt(searchParams.get('children') || searchParams.get('child') || '0')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Rooms:</span>
              <span className="text-gray-700">{searchParams.get('rooms') || searchParams.get('room') || '1'}</span>
            </div>
            
            {/* Show availability warnings */}
            {availability && (
              <div className="space-y-2 mt-3">
                {availability.requestedRooms > availability.availableRooms && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                    ⚠️ Only {availability.availableRooms} room{availability.availableRooms !== 1 ? 's' : ''} available (requested {availability.requestedRooms})
                  </div>
                )}
                {availability.totalRequestedGuests > availability.maxGuestCapacity && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                    ⚠️ Maximum {availability.maxGuestCapacity} guest{availability.maxGuestCapacity !== 1 ? 's' : ''} allowed (requested {availability.totalRequestedGuests})
                  </div>
                )}
                {(availability.requestedAdults !== availability.validAdults || availability.requestedChildren !== availability.validChildren) && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    ℹ️ Guest count adjusted to fit room capacity
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Pricing Section */}
        {hasRooms && price > 0 ? (
          <>
            <div className="border-t pt-4 space-y-3">
              {(() => {
                const checkin = searchParams.get('checkin');
                const checkout = searchParams.get('checkout');
                const nights = checkin && checkout ? 
                  Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)) : 3;
                const rooms = parseInt(searchParams.get('rooms') || searchParams.get('room') || '1');
                const pricePerNight = price / nights;
                const totalPrice = price;
                const taxes = Math.round(totalPrice * 0.1);
                
                return (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{nights} night{nights !== 1 ? 's' : ''} × {rooms} room{rooms !== 1 ? 's' : ''} × ${pricePerNight.toFixed(2)}/night</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Taxes & fees</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-lg border-t pt-3">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-500" data-cy="total-price">${(totalPrice + taxes).toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105" 
              size="lg"
              onClick={handleReserveNow}
              data-cy="reserve-now-btn"
            >
              Reserve Now
            </Button>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-4">No rooms available for selected dates</p>
            <Button 
              className="w-full bg-gray-400 cursor-not-allowed rounded-lg" 
              size="lg"
              disabled
            >
              No Availability
            </Button>
          </div>
        )}
        
        <p className="text-xs text-hotel-text-secondary text-center bg-gray-50 p-3 rounded-lg">
          ✨ Free cancellation until 24 hours before check-in
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingCard;