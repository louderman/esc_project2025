import { useEffect, useRef, useState } from 'react';
import inputStyles from '../inputbox.module.css';
import styles from './dateinput.module.css';
import Calendar from './Calendar/Calendar';
import type { SearchbarErrorState } from '../SearchBar';
import ErrorMsgBox from '../ErrorMsgBox';

export type StayDatesState = {
  checkinDate: Date | null;
  checkoutDate: Date | null;
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
function calcNights(checkinDate: Date | null, checkoutDate: Date | null) {
  if (!checkinDate || !checkoutDate) {
    return 0;
  }

  return Math.round(
    (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function DateInput({
  errorMsg,
  setErrorMsg,
  stayDates,
  setStayDates,
}: {
  errorMsg: SearchbarErrorState;
  setErrorMsg: React.Dispatch<React.SetStateAction<SearchbarErrorState>>;
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
}) {
  const [showCal, setShowCal] = useState(false);

  const nightCount = calcNights(stayDates.checkinDate, stayDates.checkoutDate);

  const calWrapperRef = useRef<HTMLDivElement>(null);
  const inputButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (
        !calWrapperRef.current?.contains(ev.target as Node) &&
        !inputButtonRef.current?.contains(ev.target as Node)
      ) {
        setShowCal(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={inputStyles.inputWrapper}>
      {errorMsg.stayDate && <ErrorMsgBox errorMsg={errorMsg.stayDate} />}
      <img src='/listing/calendar.svg' />
      <button
        ref={inputButtonRef}
        onClick={() => {
          setErrorMsg((prev) => ({ ...prev, stayDate: '' }));
          setShowCal((prev) => !prev);
        }}
        className={`${inputStyles.inputBox} ${styles.button} ${
          stayDates.checkinDate ? styles.hasDate : ''
        }`}
        data-testid="date-input"
      >
        {!stayDates.checkinDate && (
          <>select check in &nbsp;&nbsp;&mdash;&nbsp;&nbsp; check out date</>
        )}
        {stayDates.checkinDate && (
          <span data-testid='check-in-out-dates'>
            {`${formatDate(stayDates.checkinDate)}  -  ${formatDate(stayDates.checkoutDate)}  (${nightCount} night${nightCount > 1 ? 's' : ''})`}
          </span>
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
