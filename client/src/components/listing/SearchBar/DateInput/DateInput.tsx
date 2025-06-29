import { useEffect, useRef, useState } from 'react';
import inputStyles from '../inputbox.module.css';
import styles from './dateinput.module.css';
import Calendar from './Calendar/Calendar';

export type StayDatesState = {
  startDate: Date | null;
  endDate: Date | null;
};

function formatDate(date: Date | null) {
  if (date === null) {
    return '?';
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Duplicated function (same as Calendar.tsx), TODO
function calcNights(startDate: Date | null, endDate: Date | null) {
  if (!startDate || !endDate) {
    return 0;
  }

  return Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function DateInput({
  stayDates,
  setStayDates,
}: {
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
}) {
  const [showCal, setShowCal] = useState(false);

  const nightCount = calcNights(stayDates.startDate, stayDates.endDate);

  const calWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (
        calWrapperRef.current &&
        !calWrapperRef.current.contains(ev.target as Node)
      ) {
        setShowCal(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={inputStyles.inputWrapper}>
      <img src='/listing/calendar.svg' />
      <button
        onClick={() => setShowCal(true)}
        className={`${inputStyles.inputBox} ${styles.button} ${
          stayDates.startDate ? styles.hasDate : ''
        }`}>
        {!stayDates.startDate && (
          <>select check in &nbsp;&nbsp;&mdash;&nbsp;&nbsp; check out date</>
        )}
        {stayDates.startDate && (
          <>
            {formatDate(stayDates.startDate)}
            &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
            {formatDate(stayDates.endDate)}
            &nbsp;&nbsp;({nightCount} night{nightCount > 1 ? 's' : ''})
          </>
        )}
      </button>
      <div className={styles.calendar} ref={calWrapperRef}>
        {showCal && (
          <Calendar stayDates={stayDates} setStayDates={setStayDates} />
        )}
      </div>
    </div>
  );
}
