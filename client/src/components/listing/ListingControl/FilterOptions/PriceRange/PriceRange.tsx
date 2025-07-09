import { useEffect, useMemo, useState } from 'react';
import styles from './pricerange.module.css';
import Slider from './Slider';

export default function PriceRange({ data }: { data: number[] }) {
  const rangeBoundary = useMemo(() => {
    const min = Math.floor(Math.min(...data));
    const max = Math.ceil(Math.max(...data));
    return [min, max];
  }, [data]);
  useEffect(() => {
    setPriceRange(rangeBoundary);
    setLastValidRange(rangeBoundary);
  }, rangeBoundary);

  const [priceRange, setPriceRange] = useState([
    rangeBoundary[0],
    rangeBoundary[1],
  ]);
  const [lastValidRange, setLastValidRange] = useState([
    rangeBoundary[0],
    rangeBoundary[1],
  ]);
  function handleChangePrice(ev: React.ChangeEvent<HTMLInputElement>) {
    const name = ev.currentTarget.name;
    let value = parseFloat(ev.currentTarget.value.replace(/[,-]/g, ''));
    if (isNaN(value)) value = 0;

    setPriceRange((prev) =>
      name === 'min' ? [value, prev[1]] : [prev[0], value]
    );
  }

  function handleSetPrice() {
    if (
      priceRange[0] > priceRange[1] ||
      priceRange[0] < rangeBoundary[0] ||
      priceRange[1] > rangeBoundary[1]
    ) {
      setPriceRange(lastValidRange);
    } else {
      setLastValidRange(priceRange);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sliderSection}>
        <Slider
          data={data}
          selectedRange={priceRange}
          setSelectedRange={setPriceRange}
        />
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
