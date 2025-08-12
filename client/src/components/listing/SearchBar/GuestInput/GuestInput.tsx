import inputStyles from '../inputbox.module.css';
import Counter from './Counter';
import styles from './guestinput.module.css';
import { useEffect, useRef, useState } from 'react';

export type OccupancyState = {
  adults: number;
  children: number;
  rooms: number;
};

const MIN_VALUE: Record<keyof OccupancyState, number> = {
  adults: 1,
  children: 0,
  rooms: 1,
};

export default function GuestInput({
  occupancy,
  setOccupancy,
}: {
  occupancy: OccupancyState;
  setOccupancy: React.Dispatch<React.SetStateAction<OccupancyState>>;
}) {
  const [showPanel, setShowPanel] = useState(false);
  const panelWrapperRef = useRef<HTMLDivElement>(null);
  const inputButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (
        !panelWrapperRef.current?.contains(ev.target as Node) &&
        !inputButtonRef.current?.contains(ev.target as Node)
      ) {
        setShowPanel(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={inputStyles.inputWrapper}>
      <img src='/listing/guest.svg' />
      <button
        ref={inputButtonRef}
        className={`${inputStyles.inputBox} ${styles.button}`}
        onClick={() => setShowPanel((prev) => !prev)}
        data-testid='occupancy'
      >
        {occupancy.adults} adult{occupancy.adults > 1 && 's'} ·{' '}
        {occupancy.children} child{occupancy.children > 1 && 'ren'} ·{' '}
        {occupancy.rooms} room{occupancy.rooms > 1 && 's'}
      </button>
      {showPanel && (
        <div ref={panelWrapperRef} className={styles.panelSection} data-testid="guest-panel">
          <div className={styles.panelContainer}>
            {(Object.keys(occupancy) as Array<keyof OccupancyState>).map(
              (info) => (
                <div
                  data-testid={`div-${info}`}
                  key={`info-${info}`}
                  className={styles.rowContainer}
                >
                  <span>{info}</span>
                  <Counter
                    count={occupancy[info]}
                    minValue={MIN_VALUE[info]}
                    onChange={(val: number) => {
                      setOccupancy((prev) => ({ ...prev, [info]: val }));
                    }}
                  />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
