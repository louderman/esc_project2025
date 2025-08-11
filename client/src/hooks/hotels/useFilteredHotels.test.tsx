import { describe } from 'node:test';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';
import { expect, it } from 'vitest';
import {
  FILTER_OPTIONS,
  type FilterByOptions,
} from '../../reducers/listingReducer';
import { renderHook } from '@testing-library/react';
import { useFilteredHotels } from './useFilteredHotels';
import type { AmenityKey } from '../../constants/amenities';

const mockHotelsWithPrice = [
  {
    id: '1',
    name: 'Hotel 1',
    rating: 5,
    amenities: { kitchen: true, tVInRoom: true },
    categories: { overall: { score: 95 } },
    price: 250,
    latitude: 1.5,
    longitude: 1.5,
  },
  {
    id: '2',
    name: 'Hotel 2',
    rating: 3,
    amenities: { outdoorPool: true },
    categories: { overall: { score: 60 } },
    price: 80,
    latitude: 1.5,
    longitude: 1.5,
  },
  {
    id: '3',
    name: 'Hotel 3',
    rating: 4,
    amenities: { kitchen: true, hairDryer: true },
    categories: { overall: { score: 85 } },
    price: 150,
    latitude: 1.5,
    longitude: 1.5,
  },
  {
    id: '4',
    name: 'Hotel 4',
    rating: 5,
    amenities: { continentalBreakfast: true },
    categories: { overall: { score: 70 } },
    price: 300,
    latitude: 1.5,
    longitude: 1.5,
  },
] as (Price & Hotel)[];

const baseFilters: FilterByOptions = {
  priceRange: [-1, 1000000],
  amenities: [],
  stars: [],
  guestRating: 0,
  latLngBounds: {
    minLat: -90,
    maxLat: 90,
    minLng: -180,
    maxLng: 180,
  },
};

describe('useFilteredHotels', () => {
  const setupHook = (filters: FilterByOptions) =>
    renderHook(() => useFilteredHotels(mockHotelsWithPrice, filters));

  // Price Range
  describe('Price Range Filter', () => {
    const testCases: [string, [number, number], string[]][] = [
      ['standard range', [100, 200], ['3']],
      ['inclusive lower bound', [150, 160], ['3']],
      ['inclusive upper bound', [140, 150], ['3']],
      ['exact value', [150, 150], ['3']],
      ['out of range', [151, 160], []],
      ['multiple matches', [250, 300], ['1', '4']],
    ];

    testCases.forEach(([label, range, expectedIds]) => {
      it(`Test price range filter: ${label}`, () => {
        const { result } = setupHook({ ...baseFilters, priceRange: range });
        expect(result.current.map((h) => h.id)).toEqual(expectedIds);
      });
    });
  });

  // Default filter
  it('Test returns all hotels when filters are empty', () => {
    const { result } = setupHook(baseFilters);
    expect(result.current).toHaveLength(mockHotelsWithPrice.length);
  });

  // Amenities filter
  describe('Amenities Filter', () => {
    // putting AmenitiyKey[] here as type, note that it is only subset of all amenities
    const testCases: [string, AmenityKey[], string[]][] = [
      ['matching single amenity', ['kitchen'], ['1', '3']],
      ['no amenity match', ['businessCenter'], []],
      ['matching all selected amenities', ['kitchen', 'tVInRoom'], ['1']],
      ['empty amenity filter', [], ['1', '2', '3', '4']],
    ];

    testCases.forEach(([label, amenities, expectedIds]) => {
      it(`Test amenity filter: ${label}`, () => {
        const { result } = setupHook({ ...baseFilters, amenities });
        expect(result.current.map((h) => h.id)).toEqual(expectedIds);
      });
    });
  });

  // Guest rating filter
  describe('Guest rating Filter', () => {
    const testCases: [string, number, string[]][] = [
      ['includes hotels rated 6 and above', 6, ['1', '2', '3', '4']],
      ['excludes hotels below 7.5', 7, ['1', '3', '4']],
      ['excludes hotels below 8', 8, ['1', '3']],
      ['includes hotels rated 9 and above', 9, ['1']],
      ['inclusive boundary at 9.5', 9.5, ['1']],
    ];

    testCases.forEach(([label, guestRating, expectedIds]) => {
      it(`Test guest rating filter: ${label}`, () => {
        const { result } = setupHook({ ...baseFilters, guestRating });
        expect(result.current.map((h) => h.id)).toEqual(expectedIds);
      });
    });
  });

  // Star rating filter
  describe('Star rating Filter', () => {
    const testCases: [string, number[], string[]][] = [
      ['no star rating selected', [], ['1', '2', '3', '4']],
      ['filter by single star rating', [5], ['1', '4']],
      ['filter by multiple star ratings', [3, 5], ['1', '2', '4']],
      ['no matching star ratings', [1], []],
    ];

    testCases.forEach(([label, starRatings, expectedIds]) => {
      it(`Test star rating filter: ${label}`, () => {
        const { result } = setupHook({ ...baseFilters, stars: starRatings });
        expect(result.current.map((h) => h.id)).toEqual(expectedIds);
      });
    });
  });

  // TODO: add more test cases
  // Combined filters
  describe('Combined filters', () => {
    it('Test exact combined filter match', () => {
      const filters: FilterByOptions = {
        amenities: ['kitchen', 'tVInRoom'],
        guestRating: 9.5,
        priceRange: [250, 250],
        stars: [5],
        latLngBounds: baseFilters[FILTER_OPTIONS.latLngBounds],
      };
      const { result } = setupHook(filters);
      expect(result.current.map((h) => h.id)).toEqual(['1']);
    });
  });
});
