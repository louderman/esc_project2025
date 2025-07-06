import { useState } from 'react';
import styles from './pricerange.module.css';
import Slider from './Slider';

export default function PriceRange() {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [lastValidRange, setLastValidRange] = useState([0, 1000]);

  function handleChangePrice(ev: React.ChangeEvent<HTMLInputElement>) {
    const name = ev.currentTarget.name;
    let value = parseFloat(ev.currentTarget.value.replace(/,/g, ''));
    if (isNaN(value)) value = 0;

    setPriceRange((prev) =>
      name === 'min' ? [value, prev[1]] : [prev[0], value]
    );
  }

  function handleSetPrice() {
    if (priceRange[0] > priceRange[1]) {
      setPriceRange(lastValidRange);
    } else {
      setLastValidRange(priceRange);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sliderSection}>
        <Slider />
      </div>
      <div className={styles.inputboxSection}>
        <label className={styles.inputbox}>
          <span>Min price</span>
          <div className={styles.inputGroup}>
            <span>$</span>
            <input
              type='text'
              name='min'
              onChange={handleChangePrice}
              onBlur={handleSetPrice}
              value={priceRange[0].toLocaleString()}
            />
          </div>
        </label>
        <label className={styles.inputbox}>
          <span>Max price</span>
          <div className={styles.inputGroup}>
            <span>$</span>
            <input
              type='text'
              name='max'
              onChange={handleChangePrice}
              onBlur={handleSetPrice}
              value={priceRange[1].toLocaleString()}
            />
          </div>
        </label>
      </div>
    </div>
  );
}
