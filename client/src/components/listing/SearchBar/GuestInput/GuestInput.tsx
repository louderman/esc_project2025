import inputStyles from '../inputbox.module.css';
import styles from './guestinput.module.css';
import { useEffect, useRef, useState } from 'react';

export default function GuestInput() {
  const [showPanel, setShowPanel] = useState(false);

  const panelWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (
        panelWrapperRef.current &&
        !panelWrapperRef.current.contains(ev.target as Node)
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
        className={`${inputStyles.inputBox} ${styles.button}`}
        onClick={() => setShowPanel(true)}>
        0 adult · 0 children · 0 room
      </button>
      {showPanel && (
        <div ref={panelWrapperRef} className={styles.panelSection}>
          <div className={styles.panelContainer}>panel</div>
        </div>
      )}
    </div>
  );
}
