import { useCallback, useRef } from 'react';

/**
 * useDebounceAsync
 * Returns a memoized debounced version of an async function
 *
 * @param callback - The async function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounceAsync<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = 300
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceFn = useCallback(
    (...args: Parameters<T>): Promise<ReturnType<T>> =>
      new Promise((resolve) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          const result = await callback(...args);
          resolve(result);
        }, delay);
      }),
    [callback, delay]
  );

  return debounceFn;
}
