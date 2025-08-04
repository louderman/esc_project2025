import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi, describe } from 'vitest';
import DestinationInput, { type DestinationState } from './DestinationInput';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import type { SearchbarErrorState } from '../SearchBar';

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url) => {
    console.log(url);
    if (url.includes('/api/destination/random')) {
      console.log('called');
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

afterEach(() => {
  cleanup();
});

function DestinationInputWrapper({
  defaultErrorMsg = '',
}: {
  defaultErrorMsg?: string;
}) {
  const [destination, setDestination] = useState<DestinationState>({
    id: '',
    name: '',
  });
  const [errorMsg, setErrorMsg] = useState<SearchbarErrorState>({
    destination: defaultErrorMsg,
    stayDate: '',
  });

  return (
    <MemoryRouter>
      <DestinationInput
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        destination={destination}
        setDestination={setDestination}
      />
    </MemoryRouter>
  );
}

describe('DestinationInput', () => {
  it('Test random suggestions when input is focused for the first time', async () => {
    render(<DestinationInputWrapper />);

    const input = screen.getByPlaceholderText(/Destination/);

    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });
  });

  it('Test shows suggestions for partial input "Par"', async () => {
    // I tried to use vi fake timer, but it get stucked at userEvent.click(input)
    render(<DestinationInputWrapper />);
    const input = screen.getByPlaceholderText(/Destination/);

    await userEvent.click(input);
    await userEvent.type(input, 'Par');

    // Still waiting for debounce, should show random destinations
    expect(screen.queryAllByRole('listitem')).toHaveLength(5);

    // After debounce, should show the fuzzy matched destination
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent(/Paris/);
    });

    // Check if destination input is updated with selected suggested destination value
    const items = screen.getAllByRole('listitem');
    userEvent.click(items[0]);
    await waitFor(() => {
      expect(input).toHaveValue('Paris');
    });

    // Destination dropdown should be closed
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    // After clearing input, 5 random destinations are displayed again
    await userEvent.clear(input);
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });
  });

  it('Test destination input error message is rendered', async () => {
    render(<DestinationInputWrapper defaultErrorMsg='destination error msg' />);

    let errorMsg = screen.queryByText(/destination error msg/);
    expect(errorMsg).toBeInTheDocument();

    // When user clicks on destination input, error msg should be dismissed
    const input = screen.getByPlaceholderText(/Destination/);
    await userEvent.click(input);

    errorMsg = screen.queryByText(/destination error msg/);
    expect(errorMsg).not.toBeInTheDocument();
  });
});
