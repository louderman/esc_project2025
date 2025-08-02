import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export interface HotelSearchParams {
  hotelId: string;
  destinationId: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  lang?: string;
  currency?: string;
  countryCode?: string;
}

export const useUrlParams = (): HotelSearchParams | null => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const location = useLocation();
  const [params, setParams] = useState<HotelSearchParams | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    const destinationId = searchParams.get('destination_id');
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');
    const rooms = parseInt(searchParams.get('rooms') || '1');
    const lang = searchParams.get('lang') || 'en_US';
    const currency = searchParams.get('currency') || 'SGD';
    const countryCode = searchParams.get('country_code') || 'SG';

    if (hotelId && destinationId && checkin && checkout) {
      setParams({
        hotelId,
        destinationId,
        checkin,
        checkout,
        adults,
        children,
        rooms,
        lang,
        currency,
        countryCode
      });
    } else {
      // Fallback to default values for testing
      setParams({
        hotelId: hotelId || 'diH7',
        destinationId: 'WD0M',
        checkin: '2025-10-01',
        checkout: '2025-10-07',
        adults: 2,
        children: 0,
        rooms: 1,
        lang,
        currency,
        countryCode
      });
    }
  }, [hotelId, location.search]);

  return params;
};

export const buildGuestsString = (adults: number, children: number, rooms: number): string => {
  const totalGuests = adults + children;
  
  if (rooms === 1) {
    return totalGuests.toString();
  }
  
  // For multiple rooms, distribute guests evenly
  const guestsPerRoom = Math.ceil(totalGuests / rooms);
  return Array(rooms).fill(guestsPerRoom).join('|');
};