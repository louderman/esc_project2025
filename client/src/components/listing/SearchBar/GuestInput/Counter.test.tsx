import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

afterEach(() => {
  cleanup();
});

describe('Counter', () => {
  it('Test renders count and buttons, minus disabled at minValue', () => {
    const onChange = vi.fn();
    render(<Counter count={2} minValue={1} onChange={onChange} />);

    const minusBtn = screen.getByTestId('decrement-btn');
    const plusBtn = screen.getByTestId('increment-btn');

    expect(minusBtn).toBeEnabled();
    expect(plusBtn).toBeEnabled();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it('Test minus button disabled at minValue', () => {
    const onChange = vi.fn();
    render(<Counter count={1} minValue={1} onChange={onChange} />);

    const minusBtn = screen.getByTestId('decrement-btn');
    const plusBtn = screen.getByTestId('increment-btn');

    expect(minusBtn).toBeDisabled();
    expect(plusBtn).toBeEnabled();
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  it('Test calls onChange with correct values on button clicks', async () => {
    const onChange = vi.fn();
    render(<Counter count={3} minValue={1} onChange={onChange} />);

    const minusBtn = screen.getByTestId('decrement-btn');
    const plusBtn = screen.getByTestId('increment-btn');

    await userEvent.click(minusBtn);
    expect(onChange).toHaveBeenCalledWith(2);

    await userEvent.click(plusBtn);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
