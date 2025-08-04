import { cleanup, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { StayDatesState } from '../DateInput';
import CalendarPage from './CalendarPage';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

const today = new Date();
today.setHours(0, 0, 0, 0);
const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

function CalendarTestWrapper({ date, maxDate }: { date: Date; maxDate: Date }) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: null,
    checkoutDate: null,
  });

  return (
    <CalendarPage
      date={date}
      maxDate={maxDate}
      stayDates={stayDates}
      setStayDates={setStayDates}
      hoverDate={hoverDate}
      setHoverDate={setHoverDate}
    />
  );
}

afterEach(() => {
  cleanup();
});
describe('Calendar Page', () => {
  it('Test renders correct month and year', () => {
    render(
      <CalendarTestWrapper
        date={new Date(2025, 7, 1)}
        maxDate={new Date(2026, 7, 1)}
      />
    );
    expect(screen.getByText(/August 2025/)).toBeInTheDocument();
  });

  it('Test correct number of day cells', () => {
    render(<CalendarTestWrapper date={today} maxDate={maxDate} />);

    // Check for correct number of day cells
    const dateCells = screen
      .getAllByRole('cell')
      .filter((cell) => cell.textContent?.match(/^\d+$/));
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    expect(dateCells.length).toBe(daysInMonth);
  });

  it('Test renders correct weekday headers', () => {
    render(<CalendarTestWrapper date={today} maxDate={maxDate} />);
    const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    weekdays.forEach((day) =>
      expect(screen.getByText(day)).toBeInTheDocument()
    );
  });

  it('Test correct css for checkin, between, and checkout dates', async () => {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const maxDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1,
      0
    );

    render(<CalendarTestWrapper date={nextMonth} maxDate={maxDate} />);
    const dateCells = screen
      .getAllByTestId('cell')
      .filter((cell) => cell.textContent?.match(/^\d+$/));
    expect(dateCells.length).toBeGreaterThanOrEqual(28);

    await userEvent.click(dateCells[5]); // checkin
    await userEvent.click(dateCells[20]); // checkout

    // Check for correct css classNames
    for (let i = 0; i < dateCells.length; i++) {
      if (i === 5) {
        // checkin
        expect(dateCells[i].className).toMatch(/isStart/);
        expect(dateCells[i].className).not.toMatch(/isBetween|isEnd/);
      } else if (i > 5 && i < 20) {
        // between
        expect(dateCells[i].className).toMatch(/isBetween/);
        expect(dateCells[i].className).not.toMatch(/isStart|isEnd/);
      } else if (i === 20) {
        // checkout
        expect(dateCells[i].className).toMatch(/isEnd/);
        expect(dateCells[i].className).not.toMatch(/isStart|isBetween/);
      } else {
        // outside range
        expect(dateCells[i].className).not.toMatch(/isStart|isBetween|isEnd/);
      }
    }
  });

  it('Test disable clicking on past dates and enable clicking on present and future dates', async () => {
    render(<CalendarTestWrapper date={today} maxDate={maxDate} />);

    const dateCells = screen
      .getAllByRole('cell')
      .filter((cell) => cell.textContent?.match(/^\d+$/));

    for (const cell of dateCells) {
      const day = Number(cell.textContent);
      const cellDate = new Date(today.getFullYear(), today.getMonth(), day);
      cellDate.setHours(0, 0, 0, 0);

      await userEvent.click(cell);
      if (cellDate < today) {
        expect(cell.className).not.toMatch(/isStart|isEnd|isBetween/);
      } else {
        expect(cell.className).toMatch(/isStart|isEnd/);
      }
    }
  });
});
