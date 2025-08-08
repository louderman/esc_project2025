import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { useReducer } from 'react';
import { initialListingState, listingReducer } from '@/reducers/listingReducer';
import GuestRating from './GuestRating';

beforeEach(() => {
  cleanup();
});

function GuestRatingWrapper() {
  const [state, dispatch] = useReducer(listingReducer, initialListingState);

  return <GuestRating listingState={state} listingDispatch={dispatch} />;
}

describe('GuestRating', () => {
  it('Test renders all guest rating options', () => {
    render(<GuestRatingWrapper />);
    expect(screen.getByText('Any')).toBeInTheDocument();
    expect(screen.getByText('Wonderful · 9+')).toBeInTheDocument();
    expect(screen.getByText('Excellent · 8+')).toBeInTheDocument();
    expect(screen.getByText('Good · 7+')).toBeInTheDocument();
    expect(screen.getByText('Fair · 6+')).toBeInTheDocument();
  });

  it('Test selects a rating when clicked', async () => {
    render(<GuestRatingWrapper />);
    const option = screen.getByText('Wonderful · 9+');
    await userEvent.click(option);

    const radio = screen.getByLabelText('', {
      selector: 'input[type="radio"]:checked',
    });

    expect(radio).toBeInTheDocument();
    expect((radio as HTMLInputElement).checked).toBe(true);
  });
});
