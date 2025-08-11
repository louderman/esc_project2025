import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import type { StayDatesState } from './DateInput';
import DateInput from './DateInput';
import type { SearchbarErrorState } from '../SearchBar';

afterEach(() => {
  cleanup();
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
const today = new Date();
today.setHours(0, 0, 0, 0);

function DateInputWrapper({
  defaultErrorMsg = '',
}: {
  defaultErrorMsg?: string;
}) {
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: null,
    checkoutDate: null,
  });
  const [errorMsg, setErrorMsg] = useState<SearchbarErrorState>({
    destination: '',
    stayDate: defaultErrorMsg,
  });

  return (
    <DateInput
      errorMsg={errorMsg}
      setErrorMsg={setErrorMsg}
      stayDates={stayDates}
      setStayDates={setStayDates}
    />
  );
}

describe('DateInput', () => {
  it('Test should render default text and open calendar on click', async () => {
    render(<DateInputWrapper />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/select check in/);

    await userEvent.click(button);
    const calendarPages = await screen.findAllByTestId('calendar-page');
    expect(calendarPages.length).toBe(2);
    expect(calendarPages[0]).toBeInTheDocument();
    expect(calendarPages[1]).toBeInTheDocument();
  });

  it('Test should display correct check-in, check-out and number of nights', async () => {
    render(<DateInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Click today's cell
    const todayCell = screen
      .getAllByTestId('cell')
      .find((cell) => cell.textContent === String(today.getDate()));
    expect(todayCell).toBeDefined();
    await userEvent.click(todayCell!);

    // Click next month button
    const nextBtn = screen.getByTestId('next-btn');
    expect(nextBtn).toBeDefined();
    await userEvent.click(nextBtn);

    // Select future date
    const futureCell = screen
      .getAllByTestId('cell')
      .find((cell) => cell.textContent === '10');
    expect(futureCell).toBeDefined();
    await userEvent.click(futureCell!);

    const checkoutDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      10
    );
    const formattedCheckIn = formatDate(today);
    const formattedCheckOut = formatDate(checkoutDate);
    const nights = Math.round(
      (checkoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    await userEvent.click(document.body);
    expect(screen.getByText(new RegExp(formattedCheckIn))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(formattedCheckOut))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`\\(${nights} nights\\)`))
    ).toBeInTheDocument();
  });

  it('Test should close calendar when clicking outside', async () => {
    render(<DateInputWrapper />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    const calendarPages = await screen.findAllByTestId('calendar-page');
    expect(calendarPages.length).toBe(2);

    await userEvent.click(document.body);

    await waitFor(() => {
      expect(screen.queryAllByTestId('calendar-page')).toHaveLength(0);
    });
  });

  it('Test stay date input error message is rendered', async () => {
    render(<DateInputWrapper defaultErrorMsg='stay date error msg' />);

    let errorMsg = screen.queryByText(/stay date error msg/);
    expect(errorMsg).toBeInTheDocument();

    // When user clicks on stay date input, error msg should be dismissed
    const button = screen.getByRole('button');
    await userEvent.click(button);

    errorMsg = screen.queryByText(/stay date error msg/);
    expect(errorMsg).not.toBeInTheDocument();
  });
});
