import { useEffect, useState, type MouseEvent } from 'react';
import styles from './calendarpage.module.css';
import type { StayDatesState } from '../DateInput';

const DAY_PER_MONTH = [31, 30, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/**
 * @returns normalized today's date
 * (hour, min, sec, milisec to set 0),
 * used for comparison between dates.
 */
function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function CalendarPage({
  date,
  maxDate,
  hoverDate,
  setHoverDate,
  stayDates,
  setStayDates,
}: {
  date: Date;
  maxDate: Date;
  hoverDate: Date | null;
  setHoverDate: React.Dispatch<React.SetStateAction<Date | null>>;
  stayDates: StayDatesState;
  setStayDates: React.Dispatch<React.SetStateAction<StayDatesState>>;
}) {
  const [calArray, setCalArray] = useState<(Date | null)[][]>(
    Array.from({ length: 6 }, () => Array(7).fill(null))
  );

  function handleOnClick(
    ev: MouseEvent<HTMLTableDataCellElement, globalThis.MouseEvent>,
    date: Date | null
  ) {
    ev.preventDefault();
    if (date === null || date < getTodayDate()) {
      return;
    }

    if (
      stayDates.checkinDate === null ||
      date.getTime() <= stayDates.checkinDate.getTime() ||
      stayDates.checkoutDate !== null
    ) {
      setStayDates({ checkinDate: date, checkoutDate: null });
    } else {
      setStayDates((prev) => ({ ...prev, checkoutDate: date }));
    }
  }

  useEffect(() => {
    function initCalArray(date: Date) {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); // First day in month
      const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 ~ 6 (Mon ~ Sun)

      const dates: (Date | null)[][] = Array.from({ length: 6 }, () =>
        Array(7).fill(null)
      );

      let dayOffset = 0;
      for (let i = dayOfWeek; dayOffset < DAY_PER_MONTH[date.getMonth()]; i++) {
        const curDate = new Date(firstDayOfMonth);
        curDate.setDate(curDate.getDate() + dayOffset);
        dates[Math.floor(i / 7)][i % 7] = curDate;
        dayOffset++;
      }

      setCalArray(dates);
    }

    initCalArray(date);
  }, [date]);

  return (
    <div className={styles.container}>
      <div className={styles.dateHeader}>
        {date.toLocaleString('en-US', { month: 'long' })} {date.getFullYear()}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mo</th>
            <th>Tu</th>
            <th>We</th>
            <th>Th</th>
            <th>Fr</th>
            <th>Sa</th>
            <th>Su</th>
          </tr>
        </thead>
        <tbody>
          {calArray.map((weekArr, i) => (
            // Sry code too messy :), TODO: separate calendar cell into another component
            <tr key={`cal-row-${date.getMonth()}-${i}`}>
              {weekArr.map((dayCal, j) => {
                /** Couples of styling here:
                    1. hasContent: is current cell empty
                    2. disabled: is date of current cell >= today and date <= maxDate
                    3. isToday: is today
                    4. isStart: is checkin day
                    5. isEnd: is checkout day
                    6. isBetween: is between checkin and checkout day or is between checkinDate and hoverDate
                    */
                const isToday = dayCal?.getTime() === getTodayDate().getTime();
                const isDisabled =
                  dayCal &&
                  (dayCal.getTime() < getTodayDate().getTime() ||
                    dayCal.getTime() > maxDate.getTime());
                const isStart =
                  dayCal &&
                  stayDates.checkinDate?.getTime() === dayCal.getTime();
                const isEnd =
                  dayCal &&
                  stayDates.checkoutDate?.getTime() === dayCal.getTime();
                const isBetween = (() => {
                  if (!dayCal || !stayDates.checkinDate) return false;

                  const dayTime = dayCal.getTime();
                  const startTime = stayDates.checkinDate.getTime();
                  const endTime = stayDates.checkoutDate?.getTime();
                  const hoverTime = hoverDate?.getTime();

                  if (endTime) {
                    return startTime < dayTime && dayTime < endTime;
                  }

                  if (hoverTime) {
                    return startTime < dayTime && dayTime < hoverTime;
                  }

                  return false;
                })();
                const tdClassName = [
                  dayCal && styles.hasContent,
                  isDisabled && styles.disabled,
                  isToday && styles.isToday,
                  isStart && styles.isStart,
                  isEnd && styles.isEnd,
                  isBetween && styles.isBetween,
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <td
                    onMouseEnter={() => setHoverDate(dayCal)}
                    onMouseLeave={() => {
                      if (hoverDate?.getTime() === dayCal?.getTime())
                        setHoverDate(null);
                    }}
                    onClick={(e) => {
                      if (!isDisabled) handleOnClick(e, dayCal);
                    }}
                    className={tdClassName}
                    key={`cal-cell-${date.getMonth()}-${i}-${j}`}
                  >
                    <div>{dayCal?.getDate()}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
