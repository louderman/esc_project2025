import { cleanup, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { StayDatesState } from '../DateInput';
import Calendar from './Calendar';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});
function CalendarTestWrapper() {
  const [stayDates, setStayDates] = useState<StayDatesState>({
    checkinDate: null,
    checkoutDate: null,
  });

  return <Calendar stayDates={stayDates} setStayDates={setStayDates} />;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const today = new Date();
today.setHours(0, 0, 0, 0);

describe('Calendar', () => {
  it('Test 2 calendar pages are rendered', () => {
    render(<CalendarTestWrapper />);
    const calendarPages = screen.getAllByTestId('calendar-page');
    expect(calendarPages.length).toBe(2);
  });

  it('Test renders two calendar pages with current and next month', () => {
    render(<CalendarTestWrapper />);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
    const monthRegex = (date: Date) =>
      new RegExp(
        `${date.toLocaleDateString('default', {
          month: 'long',
        })} ${date.getFullYear()}`
      );

    expect(screen.getByText(monthRegex(today))).toBeInTheDocument();
    expect(screen.getByText(monthRegex(nextMonth))).toBeInTheDocument();
  });

  it('Test selects checkin date on first click', async () => {
    render(<CalendarTestWrapper />);
    const dateCells = screen
      .getAllByRole('cell')
      .filter((cell) => cell.textContent?.match(/^\d+$/));

    await userEvent.click(dateCells[today.getDate() - 1]);
    await userEvent.unhover(dateCells[today.getDate() - 1]);
    expect(dateCells[today.getDate() - 1].className).toMatch(/isStart/);

    // Make sure that the text on bottom right corner is correct (eg "Mon, 4 Aug - ? (0 night)")
    const formattedDate = formatDate(today);
    expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
    expect(screen.getByText(new RegExp('\\?'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp('\\(0 night\\)'))).toBeInTheDocument();
  });

  it('Test correct css selectors for selecting today and a future date', async () => {
    render(<CalendarTestWrapper />);

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

    // Re-collect updated DOM after state changes
    const prevBtn = screen.getByTestId('prev-btn');
    expect(prevBtn).toBeDefined();
    await userEvent.click(prevBtn);

    const calendarPages = screen.getAllByTestId('calendar-page');
    const leftPageCells = within(calendarPages[0])
      .getAllByTestId('cell')
      .filter((cell) => cell.textContent?.match(/^\d+$/));
    const rightPageCells = within(calendarPages[1])
      .getAllByTestId('cell')
      .filter((cell) => cell.textContent?.match(/^\d+$/));
    const allCells = [...leftPageCells, ...rightPageCells];

    const hasClass = (cell: Element, className: string) =>
      cell.className.includes(className);

    const checkinCell = allCells.find((c) => hasClass(c, 'isStart'));
    const checkoutCell = allCells.find((c) => hasClass(c, 'isEnd'));
    const betweenCells = allCells.filter((c) => hasClass(c, 'isBetween'));

    expect(checkinCell?.textContent).toBe(String(today.getDate()));
    expect(checkoutCell?.textContent).toBe('10');
    expect(betweenCells.length).toBeGreaterThan(9);
  });

  it('Test correctly selects checkout date', async () => {
    render(<CalendarTestWrapper />);
    const checkoutDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      10
    );
    const formattedToday = formatDate(today);
    const formattedCheckout = formatDate(checkoutDate);
    const nights = Math.round(
      (checkoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

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

    // Number of nights should be displayed correctly when hovered on checkout date cell
    await userEvent.hover(futureCell!);
    expect(screen.getByText(new RegExp(formattedToday))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(formattedCheckout))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`\\(${nights} nights\\)`))
    ).toBeInTheDocument();

    await userEvent.click(futureCell!);
    await userEvent.unhover(futureCell!);

    // Make sure that the text on bottom right corner is correct (eg "Mon, 4 Aug - ..., 10 Sep (... night)")
    expect(screen.getByText(new RegExp(formattedToday))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(formattedCheckout))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`\\(${nights} nights\\)`))
    ).toBeInTheDocument();
  });

  it('Test prev and next month button are conditionally hidden', async () => {
    render(<CalendarTestWrapper />);

    let previousBtn: HTMLElement | null;
    let nextBtn: HTMLElement | null;

    // Initially, previous month button should be hidden
    // and next month button should be visible
    previousBtn = screen.queryByTestId('prev-btn');
    expect(previousBtn).not.toBeInTheDocument();
    nextBtn = screen.getByTestId('next-btn');
    expect(nextBtn).toBeDefined();

    // The next button should be invisible after 1 year
    for (let i = 0; i < 12; i++) {
      await userEvent.click(nextBtn);
      previousBtn = screen.queryByTestId('prev-btn');
      expect(previousBtn).toBeInTheDocument();
    }
    expect(nextBtn).not.toBeInTheDocument();

    for (let i = 0; i < 12; i++) {
      await userEvent.click(previousBtn!);
      nextBtn = screen.queryByTestId('next-btn');
      expect(nextBtn).toBeInTheDocument();
    }
    expect(previousBtn).not.toBeInTheDocument();
  }, 7000);

  it('Test repeated selection of checkin date is handled correctly', async () => {
    render(<CalendarTestWrapper />);

    // Test on next month
    const nextBtn = screen.getByTestId('next-btn');
    expect(nextBtn).toBeDefined();
    await userEvent.click(nextBtn);

    const furtherCell = screen
      .getAllByTestId('cell')
      .find((cell) => cell.textContent === '10');
    expect(furtherCell).toBeDefined();
    await userEvent.click(furtherCell!);
    expect(furtherCell?.className).toMatch(/isStart/);

    const earlierCell = screen
      .getAllByTestId('cell')
      .find((cell) => cell.textContent === '5');
    expect(earlierCell).toBeDefined();
    await userEvent.click(earlierCell!);
    expect(earlierCell?.className).toMatch(/isStart/);
    expect(furtherCell?.className).not.toMatch(/isStart/);
  });
});
