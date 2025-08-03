import { useEffect, useRef } from 'react';

const SAFE_INTERVAL = 2000; // ms

/**
 * usePollingAsync
 * A React hook that repeatedly invokes an asynchronous function (`callback`) at a specified interval,
 * and stops when the callback returns `true`.
 * @param callback - An asynchronous function that returns a boolean.
 *                   Returning `true` signals that polling should stop.
 * @param interval - Desired polling interval in milliseconds.
 *                   Actual delay will be `Math.max(SAFE_INTERVAL, interval)` to ensure a minimum delay of `SAFE_INTERVAL` seconds.
 * @example
 * usePollingAsync(async () => {
 *   const response = await fetch('/api/status');
 *   const data = await response.json();
 *   return data.done; // Stop polling if task is completed
 * }, 5000);
 */
export function usePollingAsync(
  callback: () => Promise<boolean>,
  interval: number
) {
  const stop = useRef(false);

  useEffect(() => {
    stop.current = false;

    async function loop() {
      while (!stop.current) {
        const done = await callback();
        if (done) {
          stop.current = true;
          break;
        }
        console.log(
          `waiting for ${Math.max(
            SAFE_INTERVAL,
            interval
          )}ms sec before sending another req`
        );
        await new Promise((res) =>
          setTimeout(res, Math.max(SAFE_INTERVAL, interval))
        );
      }
    }
    loop();

    return () => {
      stop.current = true;
    };
  }, [callback, interval]);
}
