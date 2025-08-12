import { useEffect, useState } from 'react';

import styles from './homepage.module.css';
import type { StayDatesState } from '../components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../components/listing/SearchBar/GuestInput/GuestInput';
import SearchBar from '../components/listing/SearchBar/SearchBar';
import type { DestinationState } from '../components/listing/SearchBar/DestinationInput/DestinationInput';
import type { Destination } from '../../../types/Destination';
import { useNavigate } from 'react-router-dom';
import { useSearchBarUrlSync } from '../hooks/url/useSearchBarUrlSync';

import DestinationCard from '../components/homepage/DestinationCard';


export default function HomePage() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: null,
    checkoutDate: null,
  });
  const [occupancy, setOccupancy] = useState<OccupancyState>({
    adults: 1,
    children: 0,
    rooms: 1,
  });
  const [shouldRedirect, setShouldRedirect] = useState(false);
  useEffect(() => {
    if (shouldRedirect) {
      syncSearchBarToURL('/listing')
    }
  }, [shouldRedirect])


  const { syncSearchBarToURL } = useSearchBarUrlSync({
    destination,
    setDestination,
    occupancy,
    setOccupancy,
    stayDates,
    setStayDates,
    navigate,
  });


  async function handleSuggestionClick(dest: Destination) {
    setDestination({id: dest.dest_id, name: dest.term});
    if (stayDates.checkinDate==null || stayDates.checkoutDate==null) {
      let oneweek: Date = new Date();
      let twoweek: Date = new Date();
      oneweek.setDate(new Date().getDate()+7)
      twoweek.setDate(new Date().getDate()+14)
      setStayDates({checkinDate: oneweek, checkoutDate: twoweek})
    }
    setShouldRedirect(prev => !prev);
  }

  function handleSearchHotel() {
    if (destination.id=='') { return; }
    syncSearchBarToURL('/listing')
  }
  
  const suggestedDests: Destination[] = [
    {id: '', dest_id: 'A6Dz', term: 'Rome, Italy', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: 'eTo1', term: 'Seoul, Republic of Korea', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: 'jiHz', term: 'New York, NY, United States', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: '5qq3', term: 'Amsterdam, Netherlands', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: 'zjTT', term: 'Dublin, DUB, Ireland', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: 'vJh2', term: 'Paris, France', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: 'YCcf', term: 'Shanghai, China', lat: 0, lng: 0, type: '', state: ''},
    {id: '', dest_id: 'YhrB', term: 'Gold Coast, QLD, Australia', lat: 0, lng: 0, type: '', state: ''}
  ]

  return (
    <div className={styles.container}>
      <div className={styles.searchbarSection}>
        <div className={styles.headerQuestion}>
          Looking for a place to stay?
        </div>
        <SearchBar
          destination={destination}
          setDestination={setDestination}
          stayDates={stayDates}
          setStayDates={setStayDates}
          occupancy={occupancy}
          setOccupancy={setOccupancy}
          onSubmit={handleSearchHotel}
        />
      </div>
      
      
      <div className={styles.destinationSuggestion}>
        <div className={styles.destinationSuggestionHeader}>
          Find Hotels in These Cities
        </div>
        <div className={styles.destinationSuggestionSubHeader}>
          Explore the world at the lowest cost!
        </div>
        <div className={styles.destinationSuggestionsBox}>
          {suggestedDests.map((dest, index) => (
            <div className={styles.destinationSuggestionsItem}>
              <DestinationCard
                dest={dest}
                onclick={handleSuggestionClick}
              />
            </div>
          ))}
        </div>
      </div>
      

      <footer className={styles.footer}>
        <div className={styles.qualitiesHeader}>
          Why Choose Us
        </div>
        <div className={styles.qualitiesBox}>
          <div className={styles.qualityItem}>
            <img src='/homepage/locationpin.png' className={styles.qualityIcon}></img>
            <div>Destinations from across the world</div>
          </div>
          <div className={styles.qualityItem}>
            <img src='/homepage/experience.png' className={styles.qualityIcon}></img>
            <div>Experienced agents</div>
          </div>
          <div className={styles.qualityItem}>
            <img src='/homepage/house.png' className={styles.qualityIcon}></img>
            <div>Buy or rent your home</div>
          </div>
          <div className={styles.qualityItem}>
            <img src='/homepage/dollar.png' className={styles.qualityIcon}></img>
            <div>Cheapest prices available</div>
          </div>
        </div>
      </footer>
    </div>
  );
}