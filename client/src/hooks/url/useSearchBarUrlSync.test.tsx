import { describe, expect, it, vi, type Mock } from 'vitest';
import { useSearchBarUrlSync } from './useSearchBarUrlSync';
import { MemoryRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { OccupancyState } from '../../components/listing/SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '../../components/listing/SearchBar/DateInput/DateInput';
import type { DestinationState } from '../../components/listing/SearchBar/DestinationInput/DestinationInput';
import { render, waitFor } from '@testing-library/react';

function TestComponent({
  onSync,
  onStateChange,
  navigateSpy,
}: {
  onSync: (syncFn: () => void) => void;
  onStateChange: (state: {
    destination: DestinationState;
    stayDates: StayDatesState;
    occupancy: OccupancyState;
    setDestination: React.Dispatch<React.SetStateAction<DestinationState>>;
    setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
    setOccupancy: React.Dispatch<React.SetStateAction<OccupancyState>>;
  }) => void;
  navigateSpy: Mock;
}) {
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

  const { syncSearchBarToURL } = useSearchBarUrlSync({
    destination,
    setDestination,
    stayDates,
    setStayDates,
    occupancy,
    setOccupancy,
    navigate: navigateSpy,
  });

  useEffect(() => {
    onSync(() => syncSearchBarToURL());
  }, [syncSearchBarToURL]);

  useEffect(() => {
    onStateChange({
      destination,
      stayDates,
      occupancy,
      setDestination,
      setStayDates,
      setOccupancy,
    });
  }, [destination, stayDates, occupancy, onStateChange]);

  return <div>test</div>;
}

const parseDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

describe('useSearchBarUrlSync', () => {
  it('Test read initial URL params and update states on mount', async () => {
    const url = `/listing?destName=%22Singapore%2C+Singapore%22&destId=%22RsBU%22&checkin=%222025-07-26%22&checkout=%222025-07-28%22&adult=2&child=1&room=2`;

    let capturedState: any = null;
    const onSync = vi.fn();

    render(
      <MemoryRouter initialEntries={[url]}>
        <TestComponent
          onSync={onSync}
          onStateChange={(s) => (capturedState = s)}
          navigateSpy={vi.fn()}
        />
      </MemoryRouter>
    );

    await Promise.resolve();

    expect(capturedState.destination.id).toBe('RsBU');
    expect(capturedState.destination.name).toBe('Singapore, Singapore');
    expect(capturedState.occupancy.adults).toBe(2);
    expect(capturedState.occupancy.children).toBe(1);
    expect(capturedState.occupancy.rooms).toBe(2);

    const expectedCheckin = parseDate('2025-07-26');
    const expectedCheckout = parseDate('2025-07-28');
    expect(capturedState.stayDates.checkinDate).toEqual(expectedCheckin);
    expect(capturedState.stayDates.checkoutDate).toEqual(expectedCheckout);
    expect(capturedState.stayDates.checkinDate.getFullYear()).toBe(2025);
    expect(capturedState.stayDates.checkinDate.getMonth()).toBe(6);
    expect(capturedState.stayDates.checkinDate.getDate()).toBe(26);
    expect(capturedState.stayDates.checkoutDate.getFullYear()).toBe(2025);
    expect(capturedState.stayDates.checkoutDate.getMonth()).toBe(6);
    expect(capturedState.stayDates.checkoutDate.getDate()).toBe(28);
  });

  it('Test correctly reflects stayDates in the URL', async () => {
    const navigateSpy = vi.fn();
    let triggerSync: () => void = () => {};
    let stateChange: any = null;
    const url = `/listing?destName=%22Singapore%2C+Singapore%22&destId=%22RsBU%22&checkin=%222025-07-26%22&checkout=%222025-07-28%22&adult=2&child=1&room=2`;

    render(
      <MemoryRouter initialEntries={[url]}>
        <TestComponent
          onSync={(syncFn) => (triggerSync = syncFn)}
          onStateChange={(s) => (stateChange = s)}
          navigateSpy={navigateSpy}
        />
      </MemoryRouter>
    );

    await Promise.resolve();

    const newCheckin = parseDate('2025-5-29');
    const newCheckout = parseDate('2025-5-30');

    await waitFor(() => {
      stateChange.setDestination({
        id: 'test_id12',
        name: 'test_name12',
      });

      stateChange.setOccupancy({
        adults: 3,
        children: 3,
        rooms: 3,
      });

      stateChange.setStayDates({
        checkinDate: newCheckin,
        checkoutDate: newCheckout,
      });
    });

    await waitFor(() => {
      expect(stateChange.stayDates.checkinDate).toEqual(newCheckin);
    });

    triggerSync();

    await Promise.resolve();
    // 1. on state change
    // 2. navigate(0) to fresh page
    expect(navigateSpy).toHaveBeenCalledTimes(2);

    const calledUrl = navigateSpy.mock.calls[0][0].search as string;
    const fullUrl = new URL('listing?' + calledUrl, 'http://localhost');
    const checkinParam = JSON.parse(fullUrl.searchParams.get('checkin') ?? '');
    const checkoutParam = JSON.parse(
      fullUrl.searchParams.get('checkout') ?? ''
    );
    const destNameParam = JSON.parse(
      fullUrl.searchParams.get('destName') ?? ''
    );
    const destIdParam = JSON.parse(fullUrl.searchParams.get('destId') ?? '');
    const childParam = JSON.parse(fullUrl.searchParams.get('child') ?? '');
    const adultParam = JSON.parse(fullUrl.searchParams.get('adult') ?? '');
    const roomParam = JSON.parse(fullUrl.searchParams.get('room') ?? '');

    expect(checkinParam).toBe('2025-05-29');
    expect(checkoutParam).toBe('2025-05-30');
    expect(destNameParam).toBe('test_name12');
    expect(destIdParam).toBe('test_id12');
    expect(childParam).toBe(3);
    expect(adultParam).toBe(3);
    expect(roomParam).toBe(3);
  });
});