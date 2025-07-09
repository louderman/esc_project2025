import { useEffect, useMemo, useRef, useState } from 'react';
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
    const min = Math.floor(Math.min(...data));
    const max = Math.ceil(Math.max(...data));
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
   * Variables:
   * 1. usefulWidth: the full width between two thumbs
   * 2. thumbDiameter: the diameter of the two thumbs
   * 3. fillWidth: the width of the active tracker
   * 4. marginLeft: the left margin of the active tracker
   * 5. dif: the range, upper_range_boundary - lower_range_boundary
   * Note: active tracker is the pink portion in between two thumbs
   *
   */
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbDiameter = 14;
  const [usefulWidth, setUsefulWidth] = useState(0);
  useEffect(() => {
    // Using resizeObserver to get the width of the slider
    // to calculate the `usefulWidth`, which is used to determine the active tracker width.
    if (!sliderRef.current) return;
    const element = sliderRef.current;
    const resizeObserver = new ResizeObserver(() => {
      setUsefulWidth(element.offsetWidth - thumbDiameter * 2);
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, [thumbDiameter]);
  const dif = rangeBoundary[1] - rangeBoundary[0];
  const marginLeft =
    thumbDiameter +
    ((Math.min(selectedRange[0], rangeBoundary[1]) - rangeBoundary[0]) / dif) *
      usefulWidth;
  const fillWidth =
    selectedRange[0] <= selectedRange[1]
      ? ((Math.min(selectedRange[1], rangeBoundary[1]) -
          Math.max(selectedRange[0], rangeBoundary[0])) /
          dif) *
        usefulWidth
      : 0;

  /**
   * Barchart bar setup
   *
   * Variables:
   * 1. BAR_COUNT: the bar count in the bar chart
   * 2. MAX_HEIGHT: the maximum height of the bar chart
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
