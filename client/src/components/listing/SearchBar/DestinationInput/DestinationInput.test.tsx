import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { describe } from 'vitest';
import DestinationInput from './DestinationInput';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url) => {
    console.log(url);
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

    if (url.includes('/api/destination/query')) {
      console.log('called');
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

  const setState = vi.fn();
  const state = { id: '', name: '' };
  render(
    <MemoryRouter>
      <DestinationInput destination={state} setDestination={setState} />
    </MemoryRouter>
  );
});

afterEach(() => {
  cleanup();
});

describe('DestinationInput', () => {
  it('Test random suggestions when input is focused for the first time', async () => {
    const input = screen.getByPlaceholderText(/Destination/);

    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });
  });

  it('Test shows suggestions for partial input "Par"', async () => {
    //     vi.useFakeTimers();
    const input = screen.getByPlaceholderText(/Destination/);

    await userEvent.click(input);
    await waitFor(async () => await userEvent.type(input, 'Par'));

    // vi.advanceTimersByTime(500);
    await Promise.resolve();
    console.log(screen.getByRole('input'));
    // await Promise.resolve();

    // expect(screen.queryAllByRole('listitem')).toHaveLength(5);

    // vi.advanceTimersByTime(500);

    // await Promise.resolve();
    // await Promise.resolve();

    // await waitFor(() => {
    //   const items = screen.getAllByRole('listitem');
    //   expect(items).toHaveLength(1);
    //   expect(items[0]).toHaveTextContent(/Paris/);
    // });

    // vi.useRealTimers();
  });
});
