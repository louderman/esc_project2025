import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import Slider from './Slider';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';

function SliderWrapper({
  data,
  setHoverCloserTo,
  setSelectedRange,
  onBlur,
}: {
  data: number[];
  setHoverCloserTo: () => void;
  setSelectedRange: () => void;
  onBlur: () => void;
}) {
  //   const [selectedRange, setSelectedRange] = useState<[number, number]>([
  //     Math.min(...data),
  //     Math.max(...data),
  //   ]);

  return (
    <Slider
      data={data}
      onBlur={onBlur}
      selectedRange={[data[3], data[data.length - 3]]}
      setSelectedRange={setSelectedRange}
      setHoverCloserTo={setHoverCloserTo}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe('Slider', () => {
  const mockData = [10, 20, 25, 35, 40, 50, 60, 100];
  let setHoverCloserTo: () => void;
  let setSelectedRange: () => void;
  let onBlur: () => void;

  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    setHoverCloserTo = vi.fn();
    setSelectedRange = vi.fn();
    onBlur = vi.fn();
  });

  it('Test the bars are rendered', () => {
    render(
      <SliderWrapper
        data={mockData}
        onBlur={onBlur}
        setSelectedRange={setSelectedRange}
        setHoverCloserTo={setHoverCloserTo}
      />
    );

    const bars = screen.queryAllByTestId('slider-bar');
    expect(bars.length).toBeGreaterThan(2);
  });

  it('Test calls setSelectedRanged on input change', async () => {
    render(
      <SliderWrapper
        data={mockData}
        onBlur={onBlur}
        setSelectedRange={setSelectedRange}
        setHoverCloserTo={setHoverCloserTo}
      />
    );

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(2);

    fireEvent.change(sliders[0], { target: { value: '50' } });

    expect(setSelectedRange).toHaveBeenCalled();
  });

  it('Test calls onBlur on mouse up', async () => {
    render(
      <SliderWrapper
        data={mockData}
        onBlur={onBlur}
        setSelectedRange={setSelectedRange}
        setHoverCloserTo={setHoverCloserTo}
      />
    );

    const sliderContainer = screen.getAllByTestId('slider-container');
    await userEvent.click(sliderContainer[0]);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('Test bars in range have correct colors', () => {
    render(
      <SliderWrapper
        data={mockData}
        onBlur={onBlur}
        setSelectedRange={setSelectedRange}
        setHoverCloserTo={setHoverCloserTo}
      />
    );

    const bars = screen.getAllByTestId('slider-bar');
    expect(bars.length).toBeGreaterThan(0);

    const selectedMinIndex = 8;
    const selectedMaxIndex = 13;
    bars.forEach((bar, index) => {
      const color = bar.style.backgroundColor;
      const heightInPx = parseInt(bar.style.height, 10);

      if (index >= selectedMinIndex && index <= selectedMaxIndex) {
        // in range, but only has color if its height is 0 (implementation issue)
        if (heightInPx > 0) {
          expect(color).toBe('rgb(255, 179, 179)');
        } else {
          expect(color).toBe('rgb(217, 217, 217)');
        }
      } else {
        expect(color).toBe('rgb(217, 217, 217)');
      }
    });
  });
});
