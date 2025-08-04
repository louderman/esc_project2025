import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import GuestInput from './GuestInput';

function GuestInputWrapper() {
  const [occupancy, setOccupancy] = useState({
    adults: 1,
    children: 0,
    rooms: 1,
  });

  return <GuestInput occupancy={occupancy} setOccupancy={setOccupancy} />;
}

afterEach(() => {
  cleanup();
});

describe('GuestInput', () => {
  it('Test shows summary text and toggles panel on button click', async () => {
    render(<GuestInputWrapper />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('1 adult · 0 child · 1 room');

    // Panel should not be visible initially
    expect(screen.queryByText('adults')).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.getByText('adults')).toBeInTheDocument();
    expect(screen.getByText('children')).toBeInTheDocument();
    expect(screen.getByText('rooms')).toBeInTheDocument();
  });

  it('Test correctly updates occupancy counts when counters are clicked', async () => {
    render(<GuestInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);

    const categories = ['adults', 'children', 'rooms'];
    for (const category of categories) {
      const row = screen.getByTestId(`div-${category}`);
      expect(row).not.toBeNull();

      if (!row) continue;

      const { getByTestId } = within(row);
      const counterVal = getByTestId('counter-val');
      const minusBtn = getByTestId('decrement-btn');
      const addBtn = getByTestId('increment-btn');

      // Initially the counts are at minimum
      const initCount = Number(counterVal.textContent);
      expect(minusBtn).toBeDisabled();
      await userEvent.click(minusBtn);
      expect(counterVal.textContent).toBe(String(initCount));

      // Increment
      await userEvent.click(addBtn);
      expect(counterVal.textContent).toBe(String(initCount + 1));
      await userEvent.click(addBtn);
      expect(counterVal.textContent).toBe(String(initCount + 2));
      // Decrement
      await userEvent.click(minusBtn);
      expect(counterVal.textContent).toBe(String(initCount + 1));
      await userEvent.click(minusBtn);
      expect(counterVal.textContent).toBe(String(initCount));
    }
  });

  it('Test updates adult text on input', async () => {
    render(<GuestInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);

    const adultRow = screen.getByTestId('div-adults');
    expect(adultRow).not.toBeNull();

    const { getByTestId } = within(adultRow);
    const counterVal = getByTestId('counter-val');
    const addBtn = getByTestId('increment-btn');

    const initCount = Number(counterVal.textContent);
    expect(button).toHaveTextContent('1 adult · 0 child · 1 room');

    await userEvent.click(addBtn);
    expect(counterVal.textContent).toBe(String(initCount + 1));
    await userEvent.click(addBtn);
    expect(counterVal.textContent).toBe(String(initCount + 2));

    expect(button).toHaveTextContent('3 adults · 0 child · 1 room');
  });

  it('Test updates children text on input', async () => {
    render(<GuestInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);

    const adultRow = screen.getByTestId('div-children');
    expect(adultRow).not.toBeNull();

    const { getByTestId } = within(adultRow);
    const counterVal = getByTestId('counter-val');
    const addBtn = getByTestId('increment-btn');

    const initCount = Number(counterVal.textContent);
    expect(button).toHaveTextContent('1 adult · 0 child · 1 room');

    await userEvent.click(addBtn);
    expect(counterVal.textContent).toBe(String(initCount + 1));
    expect(button).toHaveTextContent('1 adult · 1 child · 1 room');

    await userEvent.click(addBtn);
    expect(counterVal.textContent).toBe(String(initCount + 2));
    expect(button).toHaveTextContent('1 adult · 2 children · 1 room');
  });

  it('Test updates rooms text on input', async () => {
    render(<GuestInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);

    const adultRow = screen.getByTestId('div-rooms');
    expect(adultRow).not.toBeNull();

    const { getByTestId } = within(adultRow);
    const counterVal = getByTestId('counter-val');
    const addBtn = getByTestId('increment-btn');

    const initCount = Number(counterVal.textContent);
    expect(button).toHaveTextContent('1 adult · 0 child · 1 room');

    await userEvent.click(addBtn);
    expect(counterVal.textContent).toBe(String(initCount + 1));
    expect(button).toHaveTextContent('1 adult · 0 child · 2 rooms');
  });

  it('Test closes panel when clicking outside', async () => {
    render(<GuestInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(screen.getByText('adults')).toBeInTheDocument();
    await userEvent.click(document.body);

    expect(screen.queryByText('adults')).not.toBeInTheDocument();
  });
});
