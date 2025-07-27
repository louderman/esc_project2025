import { describe, expect, it } from 'vitest';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';
import { renderHook } from '@testing-library/react';
import { useSortedHotels } from './useSortedHotels';
import {
  SORT_OPTIONS,
  type SortByOptions,
} from '../../reducers/listingReducer';

const hotels = [
  {
    id: '1',
    name: '1',
    price: 50,
    rating: 2,
    searchRank: 3,
    categories: { overall: { score: 4.2 } },
  },
  {
    id: '2',
    name: '2',
    price: 50,
    rating: 2,
    searchRank: 5,
    categories: { overall: { score: 4.2 } },
  },

  {
    id: '3',
    name: '3',
    price: 500.52,
    rating: 5,
    searchRank: 1,
    categories: { overall: { score: 9.5 } },
  },
  {
    id: '4',
    name: '4',
    price: 150.16,
    rating: 3,
    searchRank: 5,
    categories: { overall: { score: 7.8 } },
  },
  {
    id: '5',
    name: '5',
    price: 120.15,
    rating: 4,
    searchRank: 2,
    categories: { overall: { score: null } },
  },
  {
    id: '6',
    name: '6',
    price: 80.0,
    rating: 1,
    searchRank: 4,
    categories: { overall: {} },
  },
] as (Hotel & Price)[];

type SortCase = {
  label: string;
  sortOption: SortByOptions;
  expectedResult: string[];
};

const sortCases: SortCase[] = [
  {
    label: 'Test sorts by searchRank only',
    sortOption: SORT_OPTIONS.DEFAULT,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .map((h) => h.id),
  },
  {
    label: 'Test sorts by PRICE_ASC',
    sortOption: SORT_OPTIONS.PRICE_ASC,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .sort((a, b) => a.price - b.price)
      .map((h) => h.id),
  },
  {
    label: 'Test sorts by PRICE_DESC',
    sortOption: SORT_OPTIONS.PRICE_DESC,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .sort((a, b) => b.price - a.price)
      .map((h) => h.id),
  },
  {
    label: 'Test sorts by RATING_ASC',
    sortOption: SORT_OPTIONS.RATING_ASC,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .sort((a, b) => {
        const aRating = a.categories.overall?.score ?? -1;
        const bRating = b.categories.overall?.score ?? -1;
        return aRating - bRating;
      })
      .map((h) => h.id),
  },
  {
    label: 'Test sorts by RATING_DESC',
    sortOption: SORT_OPTIONS.RATING_DESC,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .sort((a, b) => {
        const aRating = a.categories.overall?.score ?? -1;
        const bRating = b.categories.overall?.score ?? -1;
        return bRating - aRating;
      })
      .map((h) => h.id),
  },
  {
    label: 'Test sorts by STAR_ASC',
    sortOption: SORT_OPTIONS.STAR_ASC,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .sort((a, b) => a.rating - b.rating)
      .map((h) => h.id),
  },
  {
    label: 'Test sorts by STAR_DESC',
    sortOption: SORT_OPTIONS.STAR_DESC,
    expectedResult: [...hotels]
      .sort((a, b) => a.searchRank - b.searchRank)
      .sort((a, b) => b.rating - a.rating)
      .map((h) => h.id),
  },
];

describe('useSortedHotels', () => {
  // Test each sorting options
  sortCases.forEach(({ label, sortOption, expectedResult }) => {
    it(label, () => {
      const { result } = renderHook(() => useSortedHotels(hotels, sortOption));
      expect(result.current.map((h) => h.id)).toEqual(expectedResult);
    });
  });

  it('Test no sort applied', () => {
    const { result } = renderHook(
      () => useSortedHotels(hotels, SORT_OPTIONS.DEFAULT, false) // no search rank too
    );
    expect(result.current.map((h) => h.id)).toEqual(hotels.map((h) => h.id));
  });

  it('Test returns same array when hotels array is empty', () => {
    const { result } = renderHook(() =>
      useSortedHotels([], SORT_OPTIONS.PRICE_ASC)
    );
    expect(result.current).toEqual([]);
  });
});
