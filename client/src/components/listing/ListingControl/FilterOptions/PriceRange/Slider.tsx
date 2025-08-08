import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from 'react';
import styles from './slider.module.css';
import { initialListingState } from '../../../../../reducers/listingReducer';

export default function Slider({
  data,
  setHoverCloserTo,
  selectedRange,
  setSelectedRange,
  onBlur,
}: {
  data: number[];
  setHoverCloserTo: React.Dispatch<
    React.SetStateAction<'left' | 'right' | null>
  >;
  selectedRange: [number, number];
  setSelectedRange: React.Dispatch<SetStateAction<[number, number]>>;
  onBlur: () => void;
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
      Math.abs(value - selectedRange[0]) <
      Math.abs(value - Math.min(rangeBoundary[1], selectedRange[1]))
        ? [value, prev[1]]
        : [prev[0], value]
    );
  }
  function handleMouseMove(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const hoverX = ev.clientX - rect.left;
    const sliderWidth = rect.width;

    const [rangeMin, rangeMax] = rangeBoundary;
    const [leftVal, rightVal] = selectedRange;

    const valueToX = (val: number) =>
      ((val - rangeMin) / (rangeMax - rangeMin)) * sliderWidth;

    const leftX = valueToX(Math.max(leftVal, rangeMin));
    const rightX = valueToX(Math.min(rightVal, rangeMax));

    const distToLeft = Math.abs(hoverX - leftX);
    const distToRight = Math.abs(hoverX - rightX);

    setHoverCloserTo(distToLeft <= distToRight ? 'left' : 'right');
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
  // TODO: clean up this mess
  // Math.max(Math.min(selectedRange[0], rangeBoundary[1]), rangeBoundary[0])...
  // 1. Math.min(selectedRange[0], rangeBoundary[1]) is to avoid right overflow
  // 2. Math.max([1.], rangeBoundary[0]) is to avoid left overflow
  const marginLeft =
    thumbDiameter +
    ((Math.max(Math.min(selectedRange[0], rangeBoundary[1]), rangeBoundary[0]) -
      rangeBoundary[0]) /
      dif) *
      usefulWidth;
  let fillWidth =
    selectedRange[0] <= selectedRange[1]
      ? ((Math.min(selectedRange[1], rangeBoundary[1]) -
          Math.max(selectedRange[0], rangeBoundary[0])) /
          dif) *
        usefulWidth
      : 0;
  fillWidth = Math.min(
    Math.max(0, fillWidth),
    usefulWidth - (marginLeft - thumbDiameter)
  ); // Making sure that fillWidth doesn't overflow

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
      const min: number[] = Array(BAR_COUNT).fill(
        initialListingState.filterBy.priceRange[1]
      );
      const max: number[] = Array(BAR_COUNT).fill(
        initialListingState.filterBy.priceRange[0]
      );

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
        cntMax: Math.max(...cnt, 1),
      };
    }, [data, rangeBoundary, dif]);

  const isBarInRange = (min: number, max: number, [low, high]: number[]) =>
    (low <= min && min <= high) || (low <= max && max <= high);

  return (
    <div className={styles.container}>
      <div className={styles.barchartContainer} style={{ height: MAX_HEIGHT }}>
        {cntPerInterval.map((count, i) => {
          const height = (MAX_HEIGHT * count) / cntMax;
          const inRange = isBarInRange(
            minPerInterval[i],
            maxPerInterval[i],
            selectedRange
          );
          return (
            <div
              data-testid='slider-bar'
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
      <div
        className={styles.sliderContainer}
        data-testid='slider-container'
        ref={sliderRef}
        onMouseUp={onBlur}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCloserTo(null)}
      >
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
