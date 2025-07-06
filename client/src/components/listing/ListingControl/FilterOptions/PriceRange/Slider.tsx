import { useState } from 'react';
import styles from './slider.module.css';

export default function Slider() {
  const rangeBoundary = [0, 100];
  const [priceRange, setPriceRange] = useState([0, 100]);

  function handleOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(ev.currentTarget.value);
    if (isNaN(value)) return;
    console.log(value);

    setPriceRange((prev) =>
      Math.abs(value - priceRange[0]) <= Math.abs(value - priceRange[1])
        ? [value, prev[1]]
        : [prev[0], value]
    );
  }

  console.log(
    'what',
    (1.0 * priceRange[0]) / (rangeBoundary[1] - rangeBoundary[0])
  );

  return (
    <div className={styles.container}>
      <div className={styles.sliderContainer}>
        <input
          onChange={handleOnChange}
          type='range'
          value={priceRange[0]}
          className={`${styles.slider} ${styles.slider_primary}`}
        />
        <input
          onChange={handleOnChange}
          type='range'
          value={priceRange[1]}
          className={`${styles.slider} ${styles.slider_secondary}`}
        />
        <div
          className={styles.activeSliderTrack}
          style={{
            left: `${
              (100.0 * (priceRange[0] - rangeBoundary[0])) /
              (rangeBoundary[1] - rangeBoundary[0])
            }%`,
            width: `${
              (100.0 * (priceRange[1] - priceRange[0])) /
              (rangeBoundary[1] - rangeBoundary[0])
            }%`,
          }}
        />
      </div>
    </div>
  );
}
