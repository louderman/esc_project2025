import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SearchBar from "../listing/SearchBar/SearchBar";
import { type DestinationState } from "../listing/SearchBar/DestinationInput/DestinationInput";
import { type StayDatesState } from "../listing/SearchBar/DateInput/DateInput";
import { type OccupancyState } from "../listing/SearchBar/GuestInput/GuestInput";

const HotelHeader = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters and set as default values
  const destinationId = searchParams.get('destination_id')?.replace(/"/g, '') || searchParams.get('destId')?.replace(/"/g, '') || 'WD0M';
  const checkin = searchParams.get('checkin')?.replace(/"/g, '') || '2025-10-01';
  const checkout = searchParams.get('checkout')?.replace(/"/g, '') || '2025-10-07';
  const adults = parseInt(searchParams.get('adults') || searchParams.get('adult') || '2');
  const children = parseInt(searchParams.get('children') || searchParams.get('child') || '0');
  const rooms = parseInt(searchParams.get('rooms') || searchParams.get('room') || '1');
  
  // SearchBar state management with URL parameters as defaults
  const [destination, setDestination] = useState<DestinationState>({
    id: destinationId,
    name: 'Singapore' // This will be updated when destination is fetched
  });
  
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: new Date(checkin),
    checkoutDate: new Date(checkout)
  });
  
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: adults,
    children: children,
    rooms: rooms
  });

  // Update state when URL parameters change
  useEffect(() => {
    setDestination({
      id: destinationId,
      name: 'Singapore'
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
  }, [destinationId, checkin, checkout, adults, children, rooms]);

  const handleSearchSubmit = () => {
    // Redirect to listing page with new search parameters
    const listingUrl = `/listing?destination_id=${destination.id}&checkin=${stayDates.checkinDate.toISOString().split('T')[0]}&checkout=${stayDates.checkoutDate.toISOString().split('T')[0]}&adults=${occupancy.adults}&children=${occupancy.children}&rooms=${occupancy.rooms}`;
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