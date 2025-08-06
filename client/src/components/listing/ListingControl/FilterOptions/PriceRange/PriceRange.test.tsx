import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import PriceRange from './PriceRange';
import { initialListingState } from '@/reducers/listingReducer';

afterEach(() => {
  cleanup();
});

function PriceRangeWrapper({
  listingDispatch,
}: {
  listingDispatch: () => void;
}) {
  const rangeBoundary: [number, number] = [5, 100];
  const sampleData = [10, 15, 20, 25, 30, 35, 50, 80];

  const listingState = {
    ...initialListingState,
    filterBy: {
      ...initialListingState.filterBy,
      priceRange: [10, 50] as [number, number],
    },
  };
  return (
    <PriceRange
      data={sampleData}
      listingState={listingState}
      listingDispatch={listingDispatch}
      rangeBoundary={rangeBoundary}
    />
  );
}

describe('PriceRange', () => {
  it('Test renders slider and input fields', () => {
    render(<PriceRangeWrapper listingDispatch={vi.fn()} />);

    expect(screen.getByText('Min price')).toBeInTheDocument();
    expect(screen.getByText('Max price')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(2);
    expect((inputs[0] as HTMLInputElement).value).toBe('10');
    expect((inputs[1] as HTMLInputElement).value).toBe('50');
  });

  it('Test updates min input state on change', () => {
    const mockDispatch = vi.fn();
    render(<PriceRangeWrapper listingDispatch={mockDispatch} />);

    const minInput = screen.getByRole('textbox', { name: /min/i });
    fireEvent.change(minInput, { target: { value: '15' } });
    fireEvent.blur(minInput);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { priceRange: [15, 50] },
    });
  });

  it('Test updates max input state on change', () => {
    const mockDispatch = vi.fn();
    render(<PriceRangeWrapper listingDispatch={mockDispatch} />);

    const maxInput = screen.getByRole('textbox', { name: /max/i });
    fireEvent.change(maxInput, { target: { value: '60' } });
    fireEvent.blur(maxInput);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { priceRange: [10, 60] },
    });
  });

  it('Test clamps min value outside range on blur', async () => {
    const mockDispatch = vi.fn();
    render(<PriceRangeWrapper listingDispatch={mockDispatch} />);

    // Clamped with lower boundary range on min value outside range
    const minInput = screen.getByRole('textbox', { name: /min/i });
    fireEvent.change(minInput, { target: { value: '0' } });
    fireEvent.blur(minInput);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_FILTER',
        payload: {
          priceRange: [5, 50],
        },
      });
    });
  });

  it('Test clamps max value outside range on blur', async () => {
    const mockDispatch = vi.fn();
    render(<PriceRangeWrapper listingDispatch={mockDispatch} />);

    // Clamped with upper boundary range on max value outside range
    const maxInput = screen.getByRole('textbox', { name: /max/i });
    fireEvent.change(maxInput, { target: { value: '150' } });
    fireEvent.blur(maxInput);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_FILTER',
        payload: {
          priceRange: [10, 100],
        },
      });
    });
  });

  it('Test resets to last valid range if min > max', () => {
    const mockDispatch = vi.fn();
    render(<PriceRangeWrapper listingDispatch={mockDispatch} />);

    const minInput = screen.getByRole('textbox', { name: /min/i });
    fireEvent.change(minInput, { target: { value: '60' } });
    fireEvent.blur(minInput);
  });

  it('sets hoverCloserTo correctly when hovering slider', () => {
    const mockDispatch = vi.fn();
    render(<PriceRangeWrapper listingDispatch={mockDispatch} />);

    const container = screen.getByTestId('slider-container');

    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        width: 300,
        top: 0,
        bottom: 0,
        height: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    const minInputLabel = screen.getByText('Min price').closest('label');
    const maxInputLabel = screen.getByText('Max price').closest('label');

    // Hover a bit left from the middle point of two thumbs (note that thumbs are not at left and right most positions)
    fireEvent.mouseMove(container, { clientX: 83 });
    let leftHighlighted = minInputLabel?.className.includes('highlight');
    let rightHighlighted = maxInputLabel?.className.includes('highlight');
    expect(leftHighlighted).toBe(true);
    expect(rightHighlighted).toBe(false);

    // Hover a bit right from the middle point of two thumbs
    fireEvent.mouseMove(container, { clientX: 88 });
    leftHighlighted = minInputLabel?.className.includes('highlight');
    rightHighlighted = maxInputLabel?.className.includes('highlight');
    expect(leftHighlighted).toBe(false);
    expect(rightHighlighted).toBe(true);
  });
});
