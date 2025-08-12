import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SearchBar from "../listing/SearchBar/SearchBar";
import { type DestinationState } from "../listing/SearchBar/DestinationInput/DestinationInput";
import { type StayDatesState } from "../listing/SearchBar/DateInput/DateInput";
import { type OccupancyState } from "../listing/SearchBar/GuestInput/GuestInput";

const HotelHeader = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // SearchBar state management with URL parameters as defaults
  const [destination, setDestination] = useState<DestinationState>({
    id: 'WD0M',
    name: 'Singapore'
  });
  
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: new Date('2025-10-01'),
    checkoutDate: new Date('2025-10-07')
  });
  
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 2,
    children: 0,
    rooms: 1
  });

  // Update state when URL parameters change
  useEffect(() => {
    // Handle JSON-encoded values that ListingPage sends
    const parseJsonParam = (value: string | null, fallback: string) => {
      if (!value) return fallback;
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    };

    const destinationId = parseJsonParam(searchParams.get('destId'), 'WD0M');
    const destinationName = parseJsonParam(searchParams.get('destName'), 'Singapore');
    const checkin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
    const checkout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
    const adults = parseInt(parseJsonParam(searchParams.get('adult'), '2'));
    const children = parseInt(parseJsonParam(searchParams.get('child'), '0'));
    const rooms = parseInt(parseJsonParam(searchParams.get('room'), '1'));

    setDestination({
      id: destinationId,
      name: destinationName
    });
    setStayDates({
      checkinDate: new Date(checkin),
      checkoutDate: new Date(checkout)
    });
    setOccupancy({
      adults: adults,
      children: children,
      rooms: rooms
    });
  }, [searchParams]);

  const handleSearchSubmit = () => {
    // Redirect to listing page with new search parameters
    // Use the correct parameter names that ListingPage expects
    // Add null checks for dates to prevent linter errors
    if (!stayDates.checkinDate || !stayDates.checkoutDate) {
      console.error('Cannot submit search: dates are not set');
      return;
    }
    
    // JSON encode the values to match what ListingPage expects (similar to useSearchBarUrlSync)
    const listingUrl = `/listing?destId=${JSON.stringify(destination.id)}&destName=${JSON.stringify(destination.name)}&checkin=${JSON.stringify(stayDates.checkinDate.toLocaleDateString('en-CA'))}&checkout=${JSON.stringify(stayDates.checkoutDate.toLocaleDateString('en-CA'))}&adult=${JSON.stringify(occupancy.adults)}&child=${JSON.stringify(occupancy.children)}&room=${JSON.stringify(occupancy.rooms)}`;
    navigate(listingUrl);
  };

  return (
    <header className="bg-primary py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <SearchBar
          destination={destination}
          setDestination={setDestination}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
          onSubmit={handleSearchSubmit}
        />
      </div>
    </header>
  );
};

export default HotelHeader;