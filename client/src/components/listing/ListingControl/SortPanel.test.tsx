import { useReducer } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  initialListingState,
  listingReducer,
  SORT_OPTIONS,
} from '../../../reducers/listingReducer';
import SortPanel from './SortPanel';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

function TestSortPanelWrapper() {
  const [state, dispatch] = useReducer(listingReducer, initialListingState);

  return (
    <>
      <SortPanel listingState={state} listingDispatch={dispatch} />
      <div data-testid='outside'>Outside</div>
      <div data-testid='sorted-output'>{state.sortBy}</div>
    </>
  );
}

describe('SortPanel component', () => {
  afterEach(() => {
    cleanup();
  });

  it('Test opens and displays sort options on click', () => {
    render(<TestSortPanelWrapper />);

    // Open sorting dropdown
    const trigger = screen.getByTestId('sort-select');
    fireEvent.click(trigger);

    // Select sort option
    const option = screen.getByTestId('sort-option-6');
    fireEvent.click(option);

    // Check if state was updated (shown in test div)
    const output = screen.getByTestId('sorted-output');
    expect(output.textContent).toBe(SORT_OPTIONS.STAR_DESC);
  });

  it('Test closes dropdown when clicking outside', () => {
    render(<TestSortPanelWrapper />);

    // Open dropdown
    const trigger = screen.getByTestId('sort-select');
    fireEvent.click(trigger);
    expect(screen.getByTestId('sort-option-0')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByTestId('sort-option-0')).toBeNull();
  });
});
