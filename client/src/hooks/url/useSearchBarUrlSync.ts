import {
  useLocation,
  useSearchParams,
  type NavigateFunction,
} from 'react-router-dom';
import React, { useEffect, type SetStateAction } from 'react';
import type { StayDatesState } from '../../components/listing/SearchBar/DateInput/DateInput';
import type { DestinationState } from '../../components/listing/SearchBar/DestinationInput/DestinationInput';
import type { OccupancyState } from '../../components/listing/SearchBar/GuestInput/GuestInput';

type SearchBarUrlSyncOptions = {
  destination: DestinationState;
  setDestination: React.Dispatch<SetStateAction<DestinationState>>;
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<SetStateAction<StayDatesState>>;
  occupancy: OccupancyState;
  setOccupancy: React.Dispatch<SetStateAction<OccupancyState>>;
  navigate: NavigateFunction;
};

export function useSearchBarUrlSync({
  destination,
  setDestination,
  stayDates,
  setStayDates,
  occupancy,
  setOccupancy,
  navigate,
}: SearchBarUrlSyncOptions) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  /** Load from URL to search bar states on initial render */
  useEffect(() => {
    const getParsedJSON = <T>(value: string | null, fallback: T): T => {
      if (value === null) return fallback;
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    };

    const getParsedInt = (value: string | null, prev: number) =>
      value !== null && !isNaN(parseInt(value)) ? parseInt(value) : prev;

    const parseDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    // TODO1: Try not to hardcode these params?
    // TODO2: clean up these code pls
    const destinationName = getParsedJSON<string>(
      searchParams.get('destName'),
      ''
    );
    const destinationId = getParsedJSON<string>(searchParams.get('destId'), '');
    const checkin = getParsedJSON<null>(searchParams.get('checkin'), null);
    const checkout = getParsedJSON<null>(searchParams.get('checkout'), null);
    const adults = getParsedJSON<string>(searchParams.get('adult'), '');
    const children = getParsedJSON<string>(searchParams.get('child'), '');
    const rooms = getParsedJSON<string>(searchParams.get('room'), '');

    if (destinationId) {
      setDestination((prev) => ({
        ...prev,
        id: destinationId,
      }));
    }
    if (destinationName) {
      setDestination((prev) => ({
        ...prev,
        name: destinationName.replace(/"/g, '') ?? prev.name,
      }));
    }
    setStayDates((prev) => ({
      checkinDate: checkin ? parseDate(checkin) : prev.checkinDate,
      checkoutDate: checkout ? parseDate(checkout) : prev.checkoutDate,
    }));
    setOccupancy((prev) => ({
      adults: getParsedInt(adults, prev.adults),
      children: getParsedInt(children, prev.children),
      rooms: getParsedInt(rooms, prev.rooms),
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Reflect search bar state changes to URL
   * @param targetPath  the page url to redirect to. If empty, no redirection occurs and only url is updated
   * @param override  we can provide values in override to prevent using stale react states
   */
  const syncSearchBarToURL = (
    targetPath?: string,
    override?: {
      occupancy?: OccupancyState;
      stayDates?: StayDatesState;
    }
  ) => {
    const urlParams = new URLSearchParams(location.search);
    const finalOccupancy = override?.occupancy ?? occupancy;
    const finalStayDates = override?.stayDates ?? stayDates;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const syncParam = (key: string, value: any) => {
      const strValue = JSON.stringify(value);
      if (urlParams.get(key) !== strValue) {
        urlParams.set(key, strValue);
      }
    };

    syncParam('destName', destination.name);
    syncParam('destId', destination.id);
    // console.log(urlParams.toString());

    syncParam(
      'checkin',
      finalStayDates.checkinDate
        ? finalStayDates.checkinDate.toLocaleDateString('en-CA')
        : null
    );
    syncParam(
      'checkout',
      finalStayDates.checkoutDate
        ? finalStayDates.checkoutDate.toLocaleDateString('en-CA')
        : null
    );
    syncParam('adult', finalOccupancy.adults);
    syncParam('child', finalOccupancy.children);
    syncParam('room', finalOccupancy.rooms);

    navigate(
      {
        pathname: targetPath ?? location.pathname,
        search: urlParams.toString(),
      },
      {
        replace: false,
      }
    );
    navigate(0);
  };

  return { syncSearchBarToURL };
}
