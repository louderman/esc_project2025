import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import {
  initialListingState,
  listingReducer,
  type SortByOptions,
} from '@/reducers/listingReducer';
import Amenities from './Amenities';
import { AMENITY_KEYS, type AmenityKey } from '@/constants/amenities';
import { useReducer } from 'react';
import userEvent from '@testing-library/user-event';
import styles from './amenities.module.css';

beforeEach(() => {
  cleanup();
});

const mockDispatch = vi.fn();
const mockState = {
  sortBy: 'default' as SortByOptions,
  filterBy: {
    ...initialListingState.filterBy,
    amenities: ['airConditioning', 'tVInRoom'] as AmenityKey[],
  },
};

function formatAmenityKey(key: string) {
  return key
    .replace(/(tV)/g, 'tv')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) =>
      word === word.toUpperCase()
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

function AmenitiesWrapper() {
  const [listingState, listingDispatch] = useReducer(
    listingReducer,
    initialListingState
  );

  return (
    <Amenities listingState={listingState} listingDispatch={listingDispatch} />
  );
}
describe('Amenities', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('Test renders all amenity button', () => {
    render(<AmenitiesWrapper />);
    AMENITY_KEYS.forEach((key) => {
      const formattedKey = formatAmenityKey(key);
      expect(screen.getByText(formattedKey)).toBeInTheDocument();
    });
  });

  it('Test dispatches correct action when selecting an amenity', async () => {
    render(
      <Amenities listingDispatch={mockDispatch} listingState={mockState} />
    );
    const amenityToClick = AMENITY_KEYS.find(
      (a) => !mockState.filterBy.amenities.includes(a)
    )!;

    const formattedKey = formatAmenityKey(amenityToClick);
    const button = screen.getByText(formattedKey);
    await userEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: {
        amenities: [...mockState.filterBy.amenities, amenityToClick],
      },
    });
  });

  it('Test dispatches correct action when deselecting an amenity', async () => {
    render(
      <Amenities listingDispatch={mockDispatch} listingState={mockState} />
    );
    const amenityToRemove = mockState.filterBy.amenities[0];
    const formattedKey = formatAmenityKey(amenityToRemove);
    const button = screen.getByText(formattedKey);
    await userEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: {
        amenities: mockState.filterBy.amenities.filter(
          (a) => a !== amenityToRemove
        ),
      },
    });
  });

  it('Test toggles amenity selection on click', async () => {
    render(<AmenitiesWrapper />);
    const button = screen.getAllByTestId('amenity-btn')[0];

    expect(button.classList.contains(styles.selected)).toBe(false);

    await userEvent.click(button);
    expect(button.classList.contains(styles.selected)).toBe(true);

    await userEvent.click(button);
    expect(button.classList.contains(styles.selected)).toBe(false);
  });

  it('Test allow multiple amenities to be selected', async () => {
    render(<AmenitiesWrapper />);
    let buttons = screen.getAllByTestId('amenity-btn');
    let firstButton = buttons[0];
    let secondButton = buttons[1];

    expect(firstButton.classList.contains(styles.selected)).toBe(false);
    expect(secondButton.classList.contains(styles.selected)).toBe(false);

    await userEvent.click(firstButton);
    await userEvent.click(secondButton);

    buttons = screen.getAllByTestId('amenity-btn');
    firstButton = buttons[0];
    secondButton = buttons[1];
    expect(firstButton.classList.contains(styles.selected)).toBe(true);
    expect(secondButton.classList.contains(styles.selected)).toBe(true);

    await userEvent.click(firstButton);
    await userEvent.click(secondButton);
    buttons = screen.getAllByTestId('amenity-btn');
    firstButton = buttons[0];
    secondButton = buttons[1];
    expect(firstButton.classList.contains(styles.selected)).toBe(false);
    expect(secondButton.classList.contains(styles.selected)).toBe(false);
  });
});
