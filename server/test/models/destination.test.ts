import { cleanup, pool } from '../../database/db';
import {
  editDistance,
  getRandomDestinations,
  searchDestinations,
  searchDestinationsInBounds,
  tableName,
} from '../../models/destinationModel';

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
    dest_id: `test_${i}`,
    term: `Test Destination ${i}`,
    lat: 1.0 + i,
    lng: 103.0 + i,
    type: 'city',
    state: 'TestState',
  }));

  beforeAll(async () => {
    for (const dest of testDestinations) {
      await pool.query(
        `INSERT INTO ${tableName} (dest_id, term, lat, lng, type, state)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dest.dest_id, dest.term, dest.lat, dest.lng, dest.type, dest.state]
      );
    }
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM ${tableName} WHERE dest_id LIKE ?`, [
      `test_%`,
    ]);
  });

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

// I can't test searchDestinationsInBounds,
// unless I test without mocking
// Test searchDestinations function
// describe('Test searchDestinations', () => {
//   const mockDests = [
//     {
//       id: 1,
//       term: 'Singapore, Singapore',
//     },
//     {
//       id: 2,
//       term: 'SUTD, Singapore',
//     },
//     {
//       id: 3,
//       term: 'New Delhi, India',
//     },
//     {
//       id: 4,
//       term: 'Kuala Lumpur, Malaysia',
//     },
//     {
//       id: 5,
//       term: 'Johor Bahru, Malaysia',
//     },
//   ];

//   let destSpy: jest.SpyInstance;
//   beforeEach(() => {
//     const module = require('../../models/destination');
//     destSpy = jest
//       .spyOn(module, 'getAllDestinations')
//       .mockReturnValue(mockDests);
//   });

//   afterEach(() => {
//     destSpy.mockRestore();
//   });

//   it('Test one missing character', async () => {
//     const dest = 'Kuala Lumpur, Malaysa';
//     const res = await searchDestinations(dest, 1, 1);
//     expect(res).toHaveLength(1);
//     expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
//   });

//   it('Test one extra character', async () => {
//     const dest = 'Kuala Lumpur, Malaysiia';
//     const res = await searchDestinations(dest, 1, 1);
//     expect(res).toHaveLength(1);
//     expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
//   });

//   it('Test one missing character on multiple words', async () => {
//     const dest = 'Kual Lumpur, Malayia';
//     const res = await searchDestinations(dest, 1, 1);
//     expect(res).toHaveLength(1);
//     expect(res[0].term).toBe('Kuala Lumpur, Malaysia');
//   });
// });

// // Test searchDestinationsInBounds function
// describe('Test searchDestinationsInBounds', () => {
//   let db: PoolConnection;

//   const testData = [
//     {
//       id: '-1',
//       dest_id: '',
//       term: '',
//       lat: 1.2834,
//       lng: 103.8607,
//       type: '',
//       state: '',
//     },
//   ];

//   beforeAll(async () => {
//     db = await pool.getConnection();
//     await db.beginTransaction();

//     for (let d of testData) {
//       await db.query(
//         `
//         INSERT INTO ${tableName} (dest_id, term, lat, lng, type, state) VALUES (?, ?, ?, ?, ?, ?)
//         `,
//         [d.dest_id, d.term, d.lat, d.lng, d.type, d.state]
//       );
//     }
//   });

//   afterAll(async () => {
//     await db.rollback();
//     db.release();
//   });

//   it('Test normal valid bounds', async () => {
//     const bounds = {
//       minLat: 1.2,
//       maxLat: 1.4,
//       minLng: 103.8,
//       maxLng: 103.9,
//     };
//     const res = await searchDestinationsInBounds(bounds);
//     expect(res).toHaveLength(2);
//   });
// });
