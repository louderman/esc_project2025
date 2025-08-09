import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface StayDatesState {
  checkinDate: Date;
  checkoutDate: Date;
}

interface CalendarProps {
  stayDates: StayDatesState;
  setStayDates: (dates: StayDatesState | ((prev: StayDatesState) => StayDatesState)) => void;
  mode?: 'checkin' | 'checkout';
  onReset?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ stayDates, setStayDates, mode = 'checkin', onReset }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start with the month of the relevant date if it exists, otherwise current month
    const relevantDate = mode === 'checkin' ? stayDates.checkinDate : stayDates.checkoutDate;
    return relevantDate ? new Date(relevantDate) : new Date();
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty days for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    // Fix the date offset issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateInRange = (date: Date) => {
    if (!stayDates.checkinDate || !stayDates.checkoutDate) return false;
    
    const checkin = new Date(stayDates.checkinDate);
    const checkout = new Date(stayDates.checkoutDate);
    const currentDate = new Date(date);
    
    return currentDate >= checkin && currentDate <= checkout;
  };

  const isCheckinDate = (date: Date) => {
    if (!stayDates.checkinDate) return false;
    return formatDate(date) === formatDate(stayDates.checkinDate);
  };

  const isCheckoutDate = (date: Date) => {
    if (!stayDates.checkoutDate) return false;
    return formatDate(date) === formatDate(stayDates.checkoutDate);
  };

  const handleDateClick = (date: Date) => {
    try {
      const currentDate = new Date(date);
      
      // Validate the date
      if (isNaN(currentDate.getTime())) {
        console.error('Invalid date selected:', date);
        return;
      }
      
      // Create a new date object to avoid timezone issues
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      // Additional validation
      if (isNaN(selectedDate.getTime())) {
        console.error('Error creating selected date');
        return;
      }
      
      if (mode === 'checkin') {
        // Set check-in date
        console.log('Setting check-in date:', selectedDate.toLocaleDateString());
        setStayDates({
          checkinDate: selectedDate,
          checkoutDate: stayDates.checkoutDate || selectedDate
        });
      } else {
        // Set check-out date
        console.log('Setting check-out date:', selectedDate.toLocaleDateString());
        setStayDates({
          checkinDate: stayDates.checkinDate || selectedDate,
          checkoutDate: selectedDate
        });
      }
    } catch (error) {
      console.error('Error handling date click:', error);
    }
  };

  const resetSelection = () => {
    try {
      if (onReset) {
        // Use the provided reset function (which will reset to original dates)
        onReset();
      } else {
        // Fallback to default reset behavior
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (mode === 'checkin') {
          setStayDates({
            checkinDate: tomorrow,
            checkoutDate: stayDates.checkoutDate || tomorrow
          });
        } else {
          setStayDates({
            checkinDate: stayDates.checkinDate || tomorrow,
            checkoutDate: tomorrow
          });
        }
      }
    } catch (error) {
      console.error('Error resetting selection:', error);
    }
  };

  const isDateDisabled = (date: Date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return true;
      }
      
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Disable past dates
      if (date < currentDate) return true;
      
      // For checkout, disable dates before check-in
      if (mode === 'checkout' && stayDates.checkinDate) {
        const checkinDate = new Date(stayDates.checkinDate);
        if (isNaN(checkinDate.getTime())) {
          return true;
        }
        checkinDate.setHours(0, 0, 0, 0);
        if (date <= checkinDate) return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if date is disabled:', error);
      return true; // Disable date if there's an error
    }
  };

  const getDateClassName = (day: Date) => {
    if (isDateDisabled(day)) {
      return 'text-gray-300 cursor-not-allowed';
    }

    if (mode === 'checkin' && isCheckinDate(day)) {
      return 'bg-orange-500 text-white font-semibold shadow-md';
    }

    if (mode === 'checkout' && isCheckoutDate(day)) {
      return 'bg-orange-600 text-white font-semibold shadow-md';
    }

    if (isDateInRange(day)) {
      return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
    }

    return 'hover:bg-gray-100 text-gray-700';
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Selection mode indicator */}
      <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-700 font-medium">
              {mode === 'checkin' ? 'Check-in' : 'Check-out'} Date Selection
            </p>
            <p className="text-xs text-orange-600">
              Click a date to select {mode === 'checkin' ? 'check-in' : 'check-out'}
            </p>
          </div>
          <button
            onClick={resetSelection}
            className="text-xs text-orange-600 hover:text-orange-800 underline"
          >
            {onReset ? 'Reset to Original' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            {day ? (
              <button
                onClick={() => handleDateClick(day)}
                disabled={isDateDisabled(day)}
                className={`
                  w-8 h-8 text-sm rounded-full transition-colors relative
                  ${getDateClassName(day)}
                `}
              >
                {day.getDate()}
                {(mode === 'checkin' && isCheckinDate(day)) && (
                  <span className="absolute -top-1 -right-1 text-xs bg-white text-orange-500 rounded-full w-3 h-3 flex items-center justify-center">
                    ✓
                  </span>
                )}
                {(mode === 'checkout' && isCheckoutDate(day)) && (
                  <span className="absolute -top-1 -right-1 text-xs bg-white text-orange-600 rounded-full w-3 h-3 flex items-center justify-center">
                    ✓
                  </span>
                )}
              </button>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${mode === 'checkin' ? 'bg-orange-500' : 'bg-orange-600'}`}></div>
            <span>{mode === 'checkin' ? 'Check-in' : 'Check-out'} Date</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
