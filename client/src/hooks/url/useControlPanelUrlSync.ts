import {
  useLocation,
  useSearchParams,
  type NavigateFunction,
} from 'react-router-dom';
import {
  FILTER_OPTIONS,
  type ListingAction,
  type ListingState,
} from '../../reducers/listingReducer';
import { useEffect, useState } from 'react';

type ControlPanelUrlSyncOptions = {
  listingState: ListingState;
  listingDispatch: React.Dispatch<ListingAction>;
  navigate?: NavigateFunction;
};

/**
 * useControlPanelUrlSync
 * Used in hotel listing page
 * Synchronize URL query parameters with hotel listing control states (filters and sorting).
 *
 * There are two responsibilities:
 * 1. On first load (component mount), read the current URL's query parameters
 *    and apply them to internal state via `setState`.
 * 2. After URL has been processed, whenever the internal state changes,
 *    reflect those changes in the URL without causing a page reload.
 *
 * Parameters:
 * - `listingState`: The listing control states from listingReducer
 * - `listingDispatch`: The dispatch function from listingReducer
 * - `navigate`: React Router’s `navigate` function used to modify the URL.
 *
 * Internal variables:
 * - `processedUrlParam`: Tracks whether URL parameters have been read and applied.
 *   Used to prevent writing defaults back to the URL during initial mount.
 *
 */
export function useControlPanelUrlSync({
  listingState,
  listingDispatch,
  navigate,
}: ControlPanelUrlSyncOptions) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [processedUrlParam, setProcessedUrlParam] = useState(false);

  /** Load from URL to listing control states on initial render */
  useEffect(() => {
    for (const key of searchParams.keys()) {
      const rawValue = searchParams.get(key);
      if (!rawValue) continue;

      try {
        const parsed = JSON.parse(rawValue);
        if (key === 'sortBy') {
          listingDispatch({ type: 'SET_SORT', payload: parsed });
        } else if (key in FILTER_OPTIONS) {
          listingDispatch({ type: 'SET_FILTER', payload: { [key]: parsed } });
        }
      } catch (e) {
        if (e instanceof Error) {
          console.warn(
            `Failed to parse URL param "${key}" raw: ${rawValue} error: ${e}`
          );
        }
      }
    }
    setProcessedUrlParam(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Reflect listing control state changes to URL */
  useEffect(() => {
    if (!processedUrlParam) return;

    const urlParams = new URLSearchParams(location.search);
    let hasChanged = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const syncParam = (key: string, value: any) => {
      const strValue = JSON.stringify(value);

      if (urlParams.get(key) !== strValue) {
        urlParams.set(key, strValue);
        hasChanged = true;
      }
    };

    Object.entries(listingState.filterBy).forEach(([key, val]) => {
      syncParam(key, val);
    });

    syncParam('sortBy', listingState.sortBy);

    if (hasChanged && !!navigate) {
      navigate(`${location.pathname}?${urlParams.toString()}`, {
        replace: true,
      });
    }
  }, [listingState, processedUrlParam, navigate, location]);
}