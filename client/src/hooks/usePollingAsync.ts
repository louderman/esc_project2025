import { useEffect, useRef } from 'react';

const SAFE_INTERVAL = 2000; // ms

/**
 * usePollingAsync
 * @param callback - Async function that returns a boolean or Promise<boolean>.
 *                   Return `true` to stop polling, `false` to continue.
 * @param interval - Desired polling interval in milliseconds.
 *                   The actual delay is the max of `interval` and a safe minimum (`SAFE_INTERVAL`).
 * @param start - Flag to start or stop polling. Polling starts only if `start` is true.
 * @param onceOnly - If true, polling will only run once even if `start` toggles.
 */
export function usePollingAsync(
  callback: () => Promise<boolean>,
  interval: number,
  start: boolean,
  onceOnly: boolean
) {
  const stop = useRef(false); // stop polling?
  const completed = useRef(false); // completed request once? (to prevent repoll when `start` changes)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!start) return;
    if (onceOnly && completed.current) return;

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

        await new Promise(
          (res) =>
            (timeoutRef.current = setTimeout(
              res,
              Math.max(SAFE_INTERVAL, interval)
            ))
        );
      }
    }
    loop();

    return () => {
      stop.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [start]); // Removed callback from dependencies since it's already stable
}
