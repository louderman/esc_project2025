import {
  editDistance,
  getRandomDestinations,
  searchDestinationsByName,
  searchDestinationsInBounds,
} from '../../models/destinationModel';
import generateRobustWorstBoundaryTCs from '../utils/generateRobustWorst';
import {
  deleteTestDestinations,
  insertTestDestinations,
  withTestDestinations,
} from '../utils/destinationTestUtils';

// Test edit distance dp function
describe('Test edit distance dp function', () => {
  it('Test 2 non-empty and identical strings', () => {
    expect(editDistance('hello', 'hello')).toBe(0);
  });

  it('Test 2 non-empty and completely different strings', () => {
    expect(editDistance('aaa', 'bbb')).toBe(3);
  });

  it('Test one string is empty', () => {
    expect(editDistance('hello', '')).toBe(5);
    expect(editDistance('', 'hello')).toBe(5);
  });

  it('Test both strings are empty', () => {
    expect(editDistance('', '')).toBe(0);
  });

  it('Test one insertion', () => {
    expect(editDistance('a', 'ab')).toBe(1);
    expect(editDistance('b', 'ab')).toBe(1);
  });

  it('Test one substitution', () => {
    expect(editDistance('aa', 'ab')).toBe(1);
    expect(editDistance('bb', 'ab')).toBe(1);
  });

  it('Test one deletion', () => {
    expect(editDistance('aa', 'a')).toBe(1);
    expect(editDistance('ab', 'a')).toBe(1);
  });

  it('Test all three mixed operations', () => {
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });
});

// Test getRandomDestinations function
describe('Test getRandomDestinations', () => {
  const testDestinations = Array.from({ length: 10 }, (_, i) => ({
    id: `test_${i}`,
    dest_id: `test_${i}`,
    term: `Test Destination ${i}`,
    lat: 1.0 + i,
    lng: 103.0 + i,
    type: 'city',
    state: 'TestState',
  }));
  withTestDestinations(testDestinations);

  it('Test returned destination length matches positive count', async () => {
    const res = await getRandomDestinations(5);
    expect(res).toHaveLength(5);
  });

  it('Test zero random destination count', async () => {
    const res = await getRandomDestinations(0);
    expect(res).toHaveLength(0);
  });

  it('Test negative random destination count', async () => {
    const res = await getRandomDestinations(-1);
    expect(res).toHaveLength(0);
  });
});

// Test searchDestinations function
describe('Test searchDestinations', () => {
  const testDestinations = [
    {
      id: `test_1`,
      dest_id: `test_1`,
      term: `Singapore, Singapore`,
      lat: 0,
      lng: 0,
      type: 'city',
      state: 'TestState',
    },
    {
      id: `test_2`,
      dest_id: `test_2`,
      term: `SUTD, Singapore`,
      lat: 0,
      lng: 0,
      type: 'city',
      state: 'TestState',
    },
    {
      id: `test_3`,
      dest_id: `test_3`,
      term: `New Delhi, India`,
      lat: 0,
      lng: 0,
      type: 'city',
      state: 'TestState',
    },
    {
      id: `test_4`,
      dest_id: `test_4`,
      term: `Kuala Lumpur, Malaysia`,
      lat: 0,
      lng: 0,
      type: 'city',
      state: 'TestState',
    },
    {
      id: `test_5`,
      dest_id: `test_5`,
      term: `Johor Bahru, Malaysia`,
      lat: 0,
      lng: 0,
      type: 'city',
      state: 'TestState',
    },
  ];
  withTestDestinations(testDestinations);

  it('Test match multiple destination with substring matching', async () => {
    const dest = 'Malaysia';
    const res = await searchDestinationsByName(dest, 0, 10);
    expect(res).toHaveLength(2);
    expect(res.every((r) => r.term.includes(dest))).toBe(true);
  });

  it('Test one missing character', async () => {
    const dest = 'Kuala Lumpur, Malaysa';
    const res = await searchDestinationsByName(dest, 1, 1);
    expect(res).toHaveLength(1);
    expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test one wrong character', async () => {
    const dest = 'Kuala Lumpua, Malaysia';
    const res = await searchDestinationsByName(dest, 1, 1);
    expect(res).toHaveLength(1);
    expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test one extra character', async () => {
    const dest = 'Kuala Lumpur, Malaysiia';
    const res = await searchDestinationsByName(dest, 1, 1);
    expect(res).toHaveLength(1);
    expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test one missing character on multiple words', async () => {
    const dest = 'Kual Lumpur, Malayia';
    const res = await searchDestinationsByName(dest, 1, 1);
    expect(res).toHaveLength(1);
    expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test match multiple destination with edit distance of 2', async () => {
    const dest = 'Malsia';
    const res = await searchDestinationsByName(dest, 2, 10);
    expect(res).toHaveLength(2);
    expect(res.every((r) => r.term.includes('Malaysia'))).toBe(true);
  });
});

// Test searchDestinationsInBounds function
describe('Test searchDestinationsInBounds (worst robust boundary testing)', () => {
  it('Test correct count of destinations within inclusive LAT and LNG bounds', async () => {
    const bounds = {
      minLat: -1.512,
      maxLat: 1.512,
      minLng: -1.511,
      maxLng: 1.511,
    };

    // Generate all the points for worst robust boundary,
    // for (minLat, minLng) <= (X, Y) <= (maxLat, maxLng), only 25 out of 45 points should be returned.
    const testDestinations = generateRobustWorstBoundaryTCs(
      {
        minX: bounds.minLat,
        maxX: bounds.maxLat,
        minY: bounds.minLng,
        maxY: bounds.maxLng,
      },
      0.1
    ).map(([lat, lng], i) => ({
      id: `Test_${i}`,
      dest_id: `Test_${i}`,
      term: `Test_${i}`,
      lat,
      lng,
      type: 'city',
      state: 'TestState',
    }));

    try {
      await insertTestDestinations(testDestinations);
      const res = await searchDestinationsInBounds(bounds);
      expect(res).toHaveLength(25);
      expect(
        res.every(
          (r) =>
            r.lat >= bounds.minLat &&
            r.lat <= bounds.maxLat &&
            r.lng >= bounds.minLng &&
            r.lng <= bounds.maxLng
        )
      ).toBe(true);
    } finally {
      await deleteTestDestinations();
    }
  }, 60000);
});