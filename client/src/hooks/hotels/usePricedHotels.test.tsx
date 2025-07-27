import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePricedHotels } from './usePricedHotels';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';

describe('usePricedHotels', () => {
  it('Test merges hotel metadata with prices correctly', () => {
    const hotels = [
      { id: 'id1', name: 'hotel 1', address: 'address1' },
      { id: 'id2', name: 'hotel 2', address: 'address2' },
      { id: 'id3', name: 'hotel 3', address: 'address3' },
    ] as Hotel[];
    const prices = [
      { id: 'id1', price: 12.34 },
      { id: 'id3', price: 10.0 },
    ] as Price[];

    const { result } = renderHook(() => usePricedHotels(hotels, prices));

    expect(result.current).toEqual([
      { id: 'id1', name: 'hotel 1', address: 'address1', price: 12.34 },
      { id: 'id3', name: 'hotel 3', address: 'address3', price: 10.0 },
    ]);
  });

  it('Test returns empty array when no matches', () => {
    const hotels = [
      { id: 'id1', name: 'hotel 1', address: 'address1' },
    ] as Hotel[];
    const prices = [{ id: 'id2', price: 10.0 }] as Price[];

    const { result } = renderHook(() => usePricedHotels(hotels, prices));

    expect(result.current).toEqual([]);
  });

  it('Test returns empty array when hotel is empty', () => {
    const prices = [{ id: 'id2', price: 10.0 }] as Price[];
    const { result } = renderHook(() => usePricedHotels([], prices));
    expect(result.current).toEqual([]);
  });

  it('Test returns empty array when price is empty', () => {
    const hotels = [
      { id: 'id1', name: 'hotel 1', address: 'address1' },
    ] as Hotel[];
    const { result } = renderHook(() => usePricedHotels(hotels, []));
    expect(result.current).toEqual([]);
  });

  it('Test returns empty array when both hotel and price are empty', () => {
    const { result } = renderHook(() => usePricedHotels([], []));
    expect(result.current).toEqual([]);
  });
});
