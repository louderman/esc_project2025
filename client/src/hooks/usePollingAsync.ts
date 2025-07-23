import { useEffect, useRef } from 'react';

const SAFE_INTERVAL = 2000; // ms

/**
 * usePollingAsync
 *
 * Invokes an asynchronous function (`callback`) at a specified interval,
 * and stops polling when the callback returns `true`.
 *
 * Once the polling is completed (callback returns `true`), it will not restart polling again
 * even if the `start` parameter changes from `false` back to `true`.
 *
 * @param callback - An asynchronous function that returns a boolean or a Promise<boolean>.
 *                   Returning `true` signals that polling should stop.
 * @param interval - Desired polling interval in milliseconds.
 *                   The actual delay between calls will be the maximum of `interval` and a safe minimum interval (`SAFE_INTERVAL`).
 * @param start    - Boolean flag to start or stop polling. Could be used to make sure all variables are loaded before polling.
 *                   Polling starts when this changes from `false` to `true`, unless polling has already completed before.
 *
 * @example
 * usePollingAsync(async () => {
 *   const response = await fetch('/api/status');
 *   const data = await response.json();
 *   return data.done; // Stop polling if task is completed
 * }, 5000, startPolling);
 *
 */
export function usePollingAsync(
  callback: () => Promise<boolean>,
  interval: number,
  start: boolean
) {
  const stop = useRef(false); // stop polling?
  const completed = useRef(false); // completed request once? (to prevent repoll when `start` changes)

  useEffect(() => {
    if (!start) return;
    if (completed.current) return;

    stop.current = false;

    async function loop() {
      while (!stop.current) {
        const done = await callback();
        if (done) {
          stop.current = true;
          completed.current = true;
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
  }, [callback, start]);
}
