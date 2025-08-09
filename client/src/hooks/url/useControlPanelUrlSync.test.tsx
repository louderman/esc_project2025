import React, { useEffect, useReducer } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, type Mock } from 'vitest';
import {
  FILTER_OPTIONS,
  initialListingState,
  listingReducer,
  SORT_OPTIONS,
} from '../../reducers/listingReducer';
import { useControlPanelUrlSync } from './useControlPanelUrlSync';
import { act, render } from '@testing-library/react';

function TestComponent({
  navigateSpy,
  onDispatchReady,
  onStateChange,
}: {
  navigateSpy: Mock;
  onDispatchReady?: (dispatch: React.Dispatch<any>) => void;
  onStateChange?: (state: typeof initialListingState) => void;
}) {
  const [listingState, listingDispatch] = useReducer(
    listingReducer,
    initialListingState
  );

  useControlPanelUrlSync({
    listingState,
    listingDispatch,
    navigate: navigateSpy,
  });

  useEffect(() => {
    onDispatchReady?.(listingDispatch);
  }, [listingDispatch, onStateChange]);

  useEffect(() => {
    onStateChange?.(listingState);
  }, [listingState, onStateChange]);

  return <div>Test</div>;
}

describe('useControlPanelUrlSync', () => {
  it('Check correctly reads filter and sort options from URL on mount', async () => {
    let receivedState: typeof initialListingState = initialListingState;

    const url = `/listing?priceRange=%5B12%2C500%5D&stars=%5B5%2C4%5D&guestRating=9&amenities=%5B%22inHouseBar%22%2C%22airConditioning%22%5D&sortBy=%22default%22`;
    render(
      <MemoryRouter initialEntries={[url]}>
        <TestComponent
          navigateSpy={vi.fn()}
          onStateChange={(state) => (receivedState = state)}
        />
      </MemoryRouter>
    );

    // useEffect tasks are in microqueue,
    // Promise.resolve to wait for all useEffects to run
    await Promise.resolve();

    expect(receivedState.sortBy).toBe('default');
    expect(receivedState.filterBy[FILTER_OPTIONS.amenities]).toEqual([
      'inHouseBar',
      'airConditioning',
    ]);
    expect(receivedState.filterBy[FILTER_OPTIONS.guestRating]).toBe(9);
    expect(receivedState.filterBy[FILTER_OPTIONS.priceRange]).toEqual([
      12, 500,
    ]);
    expect(receivedState.filterBy[FILTER_OPTIONS.stars].sort()).toEqual([4, 5]);
  });

  it('Check correctly updates URL on filter and sort options change', async () => {
    const navigateSpy = vi.fn();
    let dispatch: React.Dispatch<any> = () => {};

    render(
      <MemoryRouter initialEntries={['/listing']}>
        <TestComponent
          navigateSpy={navigateSpy}
          onDispatchReady={(d) => (dispatch = d)}
        />
      </MemoryRouter>
    );

    await Promise.resolve();

    act(() => {
      dispatch({ type: 'SET_SORT', payload: SORT_OPTIONS.PRICE_ASC });
      dispatch({
        type: 'SET_FILTER',
        payload: {
          [FILTER_OPTIONS.stars]: [5, 4],
          [FILTER_OPTIONS.amenities]: ['sauna'],
          [FILTER_OPTIONS.guestRating]: 7,
          [FILTER_OPTIONS.priceRange]: [10, 20],
        },
      });
    });

    await Promise.resolve();

    expect(navigateSpy).toHaveBeenCalledTimes(2);
    const calledUrl = navigateSpy.mock.calls[1][0] as string;
    const url = new URL(calledUrl, 'http://localhost');
    const starsParam = JSON.parse(url.searchParams.get('stars') ?? '[]').sort();
    const amenitiesParam = JSON.parse(
      url.searchParams.get('amenities') ?? '[]'
    );
    const priceRangeParam = JSON.parse(
      url.searchParams.get('priceRange') ?? '[]'
    );
    const guestRatingParam = JSON.parse(
      url.searchParams.get('guestRating') ?? ''
    );

    expect(starsParam).toEqual([4, 5]);
    expect(amenitiesParam).toEqual(['sauna']);
    expect(priceRangeParam).toEqual([10, 20]);
    expect(guestRatingParam).toBe(7);
    expect(navigateSpy.mock.calls[0][1]).toEqual({ replace: true });
  });
});