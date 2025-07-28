import { useState } from "react";
import SearchBar from "../listing/SearchBar/SearchBar";
import { type DestinationState } from "../listing/SearchBar/DestinationInput/DestinationInput";
import { type StayDatesState } from "../listing/SearchBar/DateInput/DateInput";
import { type OccupancyState } from "../listing/SearchBar/GuestInput/GuestInput";

const HotelHeader = () => {
  // SearchBar state management
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

  const handleSearchSubmit = () => {
    // Handle search submission
    console.log('Search submitted:', { destination, stayDates, occupancy });
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