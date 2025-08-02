import { useMemo, useState } from 'react';
import styles from './calendar.module.css';
import CalendarPage from './CalendarPage';
import type { StayDatesState } from '../DateInput';

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

function calcNights(checkinDate: Date | null, checkoutDate: Date | null) {
  if (!checkinDate || !checkoutDate) {
    return 0;
  }

  return Math.round(
    (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function Calendar({
  stayDates,
  setStayDates,
}: {
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
}) {
  /**
   * curDate: The reference date for the leftmost visible month in the current calendar view.
   * hoverDate: The date user is currently hovering
   * prevDate: One month before curDate (used to check if navigating backward is allowed).
   * nextDate: One month after curDate.
   * maxDate: The latest date the calendar can navigate to (1 year from today).
   */
  const today = new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  const [curDate, setCurDate] = useState(stayDates.checkinDate ?? today);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const prevDate = useMemo(
    () => new Date(curDate.getFullYear(), curDate.getMonth() - 1),
    [curDate]
  );
  const nextDate = useMemo(
    () => new Date(curDate.getFullYear(), curDate.getMonth() + 1),
    [curDate]
  );
  const maxDate = useMemo(() => {
    const date = new Date(today.getFullYear() + 1, today.getMonth() + 1, 0);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [curDate]);

  let nightCount;
  if (
    stayDates.checkinDate &&
    !stayDates.checkoutDate &&
    hoverDate &&
    hoverDate.getTime() >= stayDates.checkinDate.getTime()
  ) {
    nightCount = calcNights(stayDates.checkinDate, hoverDate);
  } else {
    nightCount = calcNights(stayDates.checkinDate, stayDates.checkoutDate);
  }

  return (
    <div className={styles.container}>
      <div className={styles.calendarSection}>
        {prevDate.getTime() >= today.getTime() && (
          <button
            onClick={() => setCurDate(prevDate)}
            className={`${styles.changeMonthBtn} ${styles.leftBtn}`}
          >
            <img
              src='/common/chevron.svg'
              alt='prev month'
              width={18}
              height={18}
            />
          </button>
        )}
        <CalendarPage
          date={curDate}
          maxDate={maxDate}
          hoverDate={hoverDate}
          setHoverDate={setHoverDate}
          stayDates={stayDates}
          setStayDates={setStayDates}
        />
        <CalendarPage
          date={nextDate}
          maxDate={maxDate}
          hoverDate={hoverDate}
          setHoverDate={setHoverDate}
          stayDates={stayDates}
          setStayDates={setStayDates}
        />
        {nextDate.getTime() <= maxDate.getTime() && (
          <button
            onClick={() => setCurDate(nextDate)}
            className={`${styles.changeMonthBtn} ${styles.rightBtn}`}
          >
            <img
              src='/common/chevron.svg'
              alt='prev month'
              width={18}
              height={18}
            />
          </button>
        )}
      </div>
      {stayDates.checkinDate && (
        <span className={styles.stayInfoSection}>
          {formatDate(stayDates.checkinDate)}
          &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
          {formatDate(stayDates.checkoutDate ?? hoverDate)}
          <span className={styles.nightCountText}>
            ({nightCount} night{nightCount > 1 ? 's' : ''})
          </span>
        </span>
      )}
    </div>
  );
}
