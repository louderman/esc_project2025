import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { useReducer } from 'react';
import {
  initialListingState,
  listingReducer,
  type ListingState,
} from '@/reducers/listingReducer';
import StarRating from './StarRating';
import styles from './starrating.module.css';

beforeEach(() => {
  cleanup();
});

const mockData = [5, 4.2, 3.9, 3.0, 2.5, 2.3, 0, 4.5, 3.1];

function GuestRatingWrapper({
  data,
  mockState,
  mockDispatch,
}: {
  data: number[];
  mockState?: ListingState;
  mockDispatch?: () => void;
}) {
  const [state, dispatch] = useReducer(listingReducer, initialListingState);

  return (
    <StarRating
      data={data}
      listingState={mockState ?? state}
      listingDispatch={mockDispatch ?? dispatch}
    />
  );
}

describe('GuestRating', () => {
  it('Test renders all rows correctly', async () => {
    render(<GuestRatingWrapper data={mockData} />);

    const countIndicators = screen.getAllByText(/\(\d+\)/);
    expect(countIndicators).toHaveLength(6);

    const rows = screen.getAllByTestId('rating-row');
    expect(rows).toHaveLength(6);
    // There should be 5 stars for all 6 rows
    rows.forEach((row) => {
      const stars = row.querySelectorAll('img');
      expect(stars.length).toBe(5);
    });
  });

  it('Test renders all star options with correct counts', async () => {
    const mockData = [5, 5, 5, 5, 4.2, 3.9, 3.0, 2.5, 2.3, 0, 4.5, 3.1];
    render(<GuestRatingWrapper data={mockData} />);

    const zeroStarCount = screen.getByText('(1)');
    expect(zeroStarCount).toBeInTheDocument();

    const oneStarCount = screen.getByText('(0)');
    expect(oneStarCount).toBeInTheDocument();

    const threeStarCount = screen.getByText('(3)');
    expect(threeStarCount).toBeInTheDocument();

    const twoAndFourStarCounts = screen.getAllByText('(2)');
    expect(twoAndFourStarCounts).toHaveLength(2);

    const fiveStarCount = screen.getByText('(4)');
    expect(fiveStarCount).toBeInTheDocument();
  });

  it('Test correct multiple selects for selected stars', async () => {
    render(<GuestRatingWrapper data={mockData} />);

    let allRows: HTMLInputElement[] = screen.getAllByRole('checkbox');

    // Click one star row
    let oneStarRow = allRows[4].closest(`.${styles.row}`);
    expect(oneStarRow).not.toBeNull();
    expect(allRows[4]).not.toBeChecked();
    await userEvent.click(oneStarRow!);
    expect(allRows[4]).toBeChecked();

    // Click three star row, should have multi select
    let threeStarRow = allRows[2].closest(`.${styles.row}`);
    expect(threeStarRow).not.toBeNull();
    expect(allRows[2]).not.toBeChecked();
    await userEvent.click(threeStarRow!);
    expect(allRows[2]).toBeChecked();

    allRows = screen.getAllByRole('checkbox');
    let checkedRows = allRows.filter((r) => r.checked);
    expect(checkedRows).toHaveLength(2);

    // Click one star row to deselect it
    oneStarRow = allRows[4].closest(`.${styles.row}`);
    expect(oneStarRow).not.toBeNull();
    expect(allRows[4]).toBeChecked();
    await userEvent.click(oneStarRow!);
    expect(allRows[4]).not.toBeChecked();

    allRows = screen.getAllByRole('checkbox');
    checkedRows = allRows.filter((r) => r.checked);
    expect(checkedRows).toHaveLength(1);
  });

  it('Test dispatch is called when the rating is selected', async () => {
    const mockDispatch = vi.fn();
    render(<GuestRatingWrapper data={mockData} mockDispatch={mockDispatch} />);

    const allRows: HTMLInputElement[] = screen.getAllByRole('checkbox');
    const oneStarRow = allRows[4].closest(`.${styles.row}`);
    expect(oneStarRow).not.toBeNull();
    expect(allRows[4]).not.toBeChecked();

    // After select 1 star row, the number `1` should be put into state
    await userEvent.click(oneStarRow!);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: {
        stars: [1],
      },
    });
  });

  it('Test dispatch is called when the rating is deselected', async () => {
    const mockDispatch = vi.fn();
    const mockState = {
      filterBy: {
        stars: [1],
      },
    } as ListingState;
    render(
      <GuestRatingWrapper
        data={mockData}
        mockState={mockState}
        mockDispatch={mockDispatch}
      />
    );

    const allRows: HTMLInputElement[] = screen.getAllByRole('checkbox');
    const oneStarRow = allRows[4].closest(`.${styles.row}`);
    expect(oneStarRow).not.toBeNull();
    expect(allRows[4]).toBeChecked();

    // After select 1 star row, the number `1` should be removed from state
    await userEvent.click(oneStarRow!);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: {
        stars: [],
      },
    });
  });
});
