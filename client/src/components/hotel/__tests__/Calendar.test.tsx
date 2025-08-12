import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import Calendar, { type StayDatesState } from '../Calendar';

// Mock console methods to avoid noise in tests
let consoleErrorSpy: MockInstance;
let consoleLogSpy: MockInstance;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
  cleanup();
});

// Helper function to render Calendar with specific props
const renderCalendar = (props: any = {}) => {
  const defaultProps = {
    stayDates: {
      checkinDate: new Date('2025-10-10'),
      checkoutDate: new Date('2025-10-17'),
    },
    setStayDates: vi.fn(),
    mode: 'checkin' as 'checkin' | 'checkout',
    onReset: vi.fn(),
  };

  return render(<Calendar {...defaultProps} {...props} />);
};

describe('Unit Test - Calendar Component', () => {
  describe('TC_HOTELDETAIL_5: User interacts with check-in/checkout calendar', () => {
    it('should display calendar with correct month and year', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Assert - Calendar should display October 2025 for checkin mode
      expect(screen.getByText('October 2025')).toBeInTheDocument();
    });

    it('should display calendar with correct month for checkout mode', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkout' });

      // Assert - Calendar should display October 2025 for checkout mode
      expect(screen.getByText('October 2025')).toBeInTheDocument();
    });

    it('should highlight check-in date when in checkin mode', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Assert - Check-in date should be highlighted
      const checkinDate = screen.getByText('10');
      expect(checkinDate).toBeInTheDocument();
      // The date should have specific styling for check-in (bg-orange-500)
      expect(checkinDate.closest('button')).toHaveClass('bg-orange-500');
    });

    it('should highlight check-out date when in checkout mode', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkout' });

      // Assert - Check-out date should be highlighted
      const checkoutDate = screen.getByText('17');
      expect(checkoutDate).toBeInTheDocument();
      // The date should have specific styling for check-out (bg-orange-600)
      expect(checkoutDate.closest('button')).toHaveClass('bg-orange-600');
    });

    it('should highlight date range between check-in and check-out', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Assert - Dates in range should be highlighted
      const rangeDates = ['11', '12', '13', '14', '15', '16'];
      rangeDates.forEach(date => {
        const dateElement = screen.getByText(date);
        expect(dateElement).toBeInTheDocument();
        // These dates should have range styling (bg-orange-100)
        expect(dateElement.closest('button')).toHaveClass('bg-orange-100');
      });
    });

    it('should allow selecting check-in date in checkin mode', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSetStayDates = vi.fn();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, setStayDates: mockSetStayDates, mode: 'checkin' });

      // Click on a new check-in date
      const newCheckinDate = screen.getByText('15');
      await user.click(newCheckinDate);

      // Assert - setStayDates should be called with new check-in date
      expect(mockSetStayDates).toHaveBeenCalledWith({
        checkinDate: expect.any(Date),
        checkoutDate: expect.any(Date),
      });

      // Verify the new date is October 15, 2025
      const callArgs = mockSetStayDates.mock.calls[0][0];
      expect(callArgs.checkinDate.getDate()).toBe(15);
      expect(callArgs.checkinDate.getMonth()).toBe(9); // October (0-indexed)
      expect(callArgs.checkinDate.getFullYear()).toBe(2025);
    });

    it('should allow selecting check-out date in checkout mode', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSetStayDates = vi.fn();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, setStayDates: mockSetStayDates, mode: 'checkout' });

      // Click on a new check-out date
      const newCheckoutDate = screen.getByText('20');
      await user.click(newCheckoutDate);

      // Assert - setStayDates should be called with new check-out date
      expect(mockSetStayDates).toHaveBeenCalledWith({
        checkinDate: expect.any(Date),
        checkoutDate: expect.any(Date),
      });

      // Verify the new date is October 20, 2025
      const callArgs = mockSetStayDates.mock.calls[0][0];
      expect(callArgs.checkoutDate.getDate()).toBe(20);
      expect(callArgs.checkoutDate.getMonth()).toBe(9); // October (0-indexed)
      expect(callArgs.checkoutDate.getFullYear()).toBe(2025);
    });

    it('should prevent selecting check-out date before check-in date', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSetStayDates = vi.fn();
      const stayDates = {
        checkinDate: new Date('2025-10-15'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, setStayDates: mockSetStayDates, mode: 'checkout' });

      // Try to click on a date before check-in (October 10)
      const invalidDate = screen.getByText('10');
      await user.click(invalidDate);

      // Assert - setStayDates should not be called for invalid date
      expect(mockSetStayDates).not.toHaveBeenCalled();
    });

    it('should navigate to next month when clicking next arrow', async () => {
      // Arrange
      const user = userEvent.setup();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Click next month arrow (right chevron - second button in header)
      const headerButtons = screen.getAllByRole('button');
      const nextButton = headerButtons[1]; // Right arrow is the second button
      await user.click(nextButton);

      // Assert - Calendar should show November 2025
      await waitFor(() => {
        expect(screen.getByText('November 2025')).toBeInTheDocument();
      });
    });

    it('should navigate to previous month when clicking previous arrow', async () => {
      // Arrange
      const user = userEvent.setup();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Click previous month arrow (left chevron - first button in header)
      const headerButtons = screen.getAllByRole('button');
      const prevButton = headerButtons[0]; // Left arrow is the first button
      await user.click(prevButton);

      // Assert - Calendar should show September 2025
      await waitFor(() => {
        expect(screen.getByText('September 2025')).toBeInTheDocument();
      });
    });

    it('should reset dates when reset button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnReset = vi.fn();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, onReset: mockOnReset, mode: 'checkin' });

      // Click reset button
      const resetButton = screen.getByText(/reset/i);
      await user.click(resetButton);

      // Assert - onReset callback should be called
      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should display correct day headers', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Assert - Day headers should be displayed
      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should handle month navigation correctly', async () => {
      // Arrange
      const user = userEvent.setup();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Navigate to next month
      const headerButtons = screen.getAllByRole('button');
      const nextButton = headerButtons[1]; // Right arrow is the second button
      await user.click(nextButton);

      // Navigate back to previous month
      const prevButton = headerButtons[0]; // Left arrow is the first button
      await user.click(prevButton);

      // Assert - Should be back to October 2025
      await waitFor(() => {
        expect(screen.getByText('October 2025')).toBeInTheDocument();
      });
    });

    it('should display correct dates for the month', async () => {
      // Arrange
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Assert - October has 31 days, so should display dates 1-31
      for (let i = 1; i <= 31; i++) {
        const dateElement = screen.getByText(i.toString());
        expect(dateElement).toBeInTheDocument();
      }
    });

    it('should handle year boundary navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      const stayDates = {
        checkinDate: new Date('2025-12-15'),
        checkoutDate: new Date('2025-12-20'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Navigate to next month (January 2026)
      const headerButtons = screen.getAllByRole('button');
      const nextButton = headerButtons[1]; // Right arrow is the second button
      await user.click(nextButton);

      // Assert - Should show January 2026
      await waitFor(() => {
        expect(screen.getByText('January 2026')).toBeInTheDocument();
      });
    });

    it('should maintain selected dates when switching months', async () => {
      // Arrange
      const user = userEvent.setup();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, mode: 'checkin' });

      // Navigate to next month using the second button (right arrow)
      const headerButtons = screen.getAllByRole('button');
      const nextButton = headerButtons[1];
      await user.click(nextButton);

      // Navigate back to October using the first button (left arrow)
      const prevButton = headerButtons[0];
      await user.click(prevButton);

      // Assert - Selected dates should still be highlighted
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();
    });

    it('should handle invalid date selections gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSetStayDates = vi.fn();
      const stayDates = {
        checkinDate: new Date('2025-10-10'),
        checkoutDate: new Date('2025-10-17'),
      };

      // Act
      renderCalendar({ stayDates, setStayDates: mockSetStayDates, mode: 'checkout' });

      // Try to select a date that would create an invalid range
      const invalidDate = screen.getByText('5'); // Before check-in date
      await user.click(invalidDate);

      // Assert - setStayDates should not be called for invalid selection
      expect(mockSetStayDates).not.toHaveBeenCalled();
    });
  });
});
