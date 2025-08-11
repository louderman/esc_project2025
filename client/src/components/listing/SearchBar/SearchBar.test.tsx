import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { DestinationState } from './DestinationInput/DestinationInput';
import type { StayDatesState } from './DateInput/DateInput';
import type { OccupancyState } from './GuestInput/GuestInput';
import SearchBar from './SearchBar';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/api/destination/random')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { id: '1', dest_id: '1', term: 't1', type: 't1' },
          { id: '2', dest_id: '2', term: 't2', type: 't2' },
          { id: '3', dest_id: '3', term: 't3', type: 't3' },
          { id: '4', dest_id: '4', term: 't4', type: 't4' },
          { id: '5', dest_id: '5', term: 't5', type: 't5' },
        ],
      });
    }

    if (url.includes('/api/destination/query/name/Par')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { id: '1', dest_id: '1', term: 'Paris', type: 'City' },
        ],
      });
    }

    return Promise.resolve({
      ok: false,
      json: async () => [],
    });
  });
});

function SearchBarWrapper({ onSubmit }: { onSubmit: () => void }) {
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

  return (
    <MemoryRouter>
      <SearchBar
        onSubmit={onSubmit}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
        destination={destination}
        setDestination={setDestination}
        stayDates={stayDates}
        setStayDates={setStayDates}
      />
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
});

describe('SearchBar', () => {
  it('Test destination, stay dates, occupancy, and search buttons are rendered', async () => {
    const onSubmit = vi.fn();
    render(<SearchBarWrapper onSubmit={onSubmit} />);

    // Wrap in waitFor because react state is changed
    await waitFor(() => {
      const destinationInp = screen.getByPlaceholderText(/Destination/);
      expect(destinationInp).toBeInTheDocument();

      const stayDatesInp = screen.getByRole('button', {
        name: /select check in/,
      });
      expect(stayDatesInp).toBeInTheDocument();

      const occupancyInp = screen.getByRole('button', {
        name: /1 adult · 0 child · 1 room/,
      });
      expect(occupancyInp).toBeInTheDocument();

      const searchBtn = screen.getByRole('button', {
        name: /find hotels/i,
      });
      expect(searchBtn).toBeInTheDocument();
    });
  });

  it('Test show error messages when destination or stay date input is invalid', async () => {
    const onSubmit = vi.fn();
    render(<SearchBarWrapper onSubmit={onSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /find hotels/i });
    await userEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(0);

    let errMsgBoxes = screen.queryAllByTestId('error-msg-box');
    expect(errMsgBoxes.length).toBe(2);

    const destinationInp = screen.getByPlaceholderText(/Destination/);
    await userEvent.click(destinationInp);
    errMsgBoxes = screen.queryAllByTestId('error-msg-box');
    expect(errMsgBoxes.length).toBe(1);

    const stayDatesInp = screen.getByRole('button', {
      name: /select check in/,
    });
    await userEvent.click(stayDatesInp);
    errMsgBoxes = screen.queryAllByTestId('error-msg-box');
    expect(errMsgBoxes.length).toBe(0);
  });
});
