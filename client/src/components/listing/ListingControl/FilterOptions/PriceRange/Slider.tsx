import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './slider.module.css';

export default function Slider({
  data,
  selectedRange,
  setSelectedRange,
}: {
  data: number[];
  selectedRange: number[];
  setSelectedRange: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const rangeBoundary = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return [min, max];
  }, [data]);

  function handleOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(ev.currentTarget.value);
    if (isNaN(value)) return;

    setSelectedRange((prev) =>
      Math.abs(value - selectedRange[0]) <= Math.abs(value - selectedRange[1])
        ? [value, prev[1]]
        : [prev[0], value]
    );
  }

  /**
   * Double-thumbed slider setup
   * Reference: https://css-tricks.com/multi-thumb-sliders-particular-two-thumb-case/
   * Setup the track color between two thumbs
   *
   * TODO: fix marginLeft and width of active tracker still buggy when width of slider is large...
   */
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbDiameter = 14;
  const [usefulWidth, setUsefulWidth] = useState(0);
  useLayoutEffect(() => {
    if (!sliderRef.current) return;
    setUsefulWidth(sliderRef.current.offsetWidth - thumbDiameter);
  }, []);
  const dif = rangeBoundary[1] - rangeBoundary[0];
  const marginLeft =
    thumbDiameter + ((selectedRange[0] - rangeBoundary[0]) / dif) * usefulWidth;
  const fillWidth =
    selectedRange[0] <= selectedRange[1]
      ? ((selectedRange[1] - selectedRange[0]) / dif) * usefulWidth
      : 0;

  /**
   * Barchart bar setup
   *
   */
  const BAR_COUNT = 30;
  const MAX_HEIGHT = 80; // px
  type BarStats = {
    cntPerInterval: number[];
    minPerInterval: number[];
    maxPerInterval: number[];
    cntMax: number;
  };
  const { cntPerInterval, minPerInterval, maxPerInterval, cntMax }: BarStats =
    useMemo(() => {
      const cnt: number[] = Array(BAR_COUNT).fill(0);
      const min: number[] = Array(BAR_COUNT).fill(Infinity);
      const max: number[] = Array(BAR_COUNT).fill(-Infinity);

      data.forEach((d) => {
        const idx = Math.min(
          Math.floor(((d - rangeBoundary[0]) / dif) * BAR_COUNT),
          BAR_COUNT - 1
        );
        cnt[idx]++;
        min[idx] = Math.min(min[idx], d);
        max[idx] = Math.max(max[idx], d);
      });

      return {
        cntPerInterval: cnt,
        minPerInterval: min,
        maxPerInterval: max,
        cntMax: Math.max(...cnt),
      };
    }, [data, rangeBoundary]);

  /** Helper to check if a bar overlaps with selected range */
  const isBarInRange = (min: number, max: number, [low, high]: number[]) =>
    (low <= min && min <= high) || (low <= max && max <= high);

  return (
    <div className={styles.container}>
      {usefulWidth}, {(selectedRange[1] - selectedRange[0]) / dif}
      <div
        style={{
          marginLeft: `${thumbDiameter}px`,
          height: '2px',
          width: usefulWidth,
          backgroundColor: 'blue',
        }}
      ></div>
      <div className={styles.barchartContainer}>
        {cntPerInterval.map((count, i) => {
          const height = (MAX_HEIGHT * count) / cntMax;
          const inRange = isBarInRange(
            minPerInterval[i],
            maxPerInterval[i],
            selectedRange
          );
          return (
            <div
              key={`bar-${i}`}
              className={styles.bar}
              style={{
                height,
                backgroundColor: inRange ? '#ffb3b3' : '#d9d9d9',
              }}
            />
          );
        })}
      </div>
      <div className={styles.sliderContainer} ref={sliderRef}>
        <div className={styles.sliderTracker} />
        <div
          className={styles.activeSliderTrack}
          style={{
            marginLeft: `${marginLeft}px`,
            width: `${fillWidth}px`,
          }}
        />
        <input
          onChange={handleOnChange}
          type='range'
          min={rangeBoundary[0]}
          max={rangeBoundary[1]}
          value={selectedRange[0]}
          className={`${styles.slider} ${styles.sliderPrimary}`}
        />
        <input
          onChange={handleOnChange}
          type='range'
          min={rangeBoundary[0]}
          max={rangeBoundary[1]}
          value={selectedRange[1]}
          className={`${styles.slider} ${styles.sliderSecondary}`}
        />
      </div>
    </div>
  );
}
