import request from 'supertest';
import app from '../../server';
import {
  deleteTestDestinations,
  insertTestDestinations,
  withTestDestinations,
} from '../utils/testDestinationUtils';
import { Destination } from '../../../types/Destination';
import generateRobustWorstBoundaryCases from '../utils/generateRobustWorst';
import { searchDestinationsInBounds } from '../../models/destinationModel';

// Test /api/destination/random route
describe.skip('GET /api/destination/random?count={}', () => {
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

  it('Test returned destination length equals to count param', async () => {
    const res = await request(app).get('/api/destination/random?count=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });
  it('Test throws status 400 on zero count', async () => {
    const res = await request(app).get('/api/destination/random?count=0');
    expect(res.statusCode).toBe(400);
  });
  it('Test throws status 400 on negative count', async () => {
    const res = await request(app).get('/api/destination/random?count=-1');
    expect(res.statusCode).toBe(400);
  });
  it('Test throws status 400 on non-numeric count', async () => {
    const res = await request(app).get('/api/destination/random?count=abc');
    expect(res.statusCode).toBe(400);
  });
  it('Test throws status 400 on non-numeric count on missing return count', async () => {
    const res = await request(app).get('/api/destination/random');
    expect(res.statusCode).toBe(400);
  });
});

// Test /api/destination/all route
describe.skip('GET /api/destination/all', () => {
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

  it('Test return all destinations', async () => {
    const res = await request(app).get('/api/destination/all');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(testDestinations.length);
  });
});

// Test /api/destination/query fuzzy matching route
describe.skip('GET /api/destination/query/:text?count={}?distance={}', () => {
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
    const res = await request(app).get(
      `/api/destination/query/${dest}?distance=${0}`
    );
    expect(res.body).toHaveLength(2);
    expect(res.body.every((r: Destination) => r.term.includes(dest))).toBe(
      true
    );
  });

  it('Test one missing character', async () => {
    const dest = 'Kuala Lumpur, Malaysa';
    const res = await request(app).get(`/api/destination/query/${dest}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test one extra character', async () => {
    const dest = 'Kuala Lumpur, Malaysiia';
    const res = await request(app).get(`/api/destination/query/${dest}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test one wrong character', async () => {
    const dest = 'Kuala Lumpua, Malaysia';
    const res = await request(app).get(`/api/destination/query/${dest}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test one missing character on multiple words', async () => {
    const dest = 'Kual Lumpur, Malayia';
    const res = await request(app).get(`/api/destination/query/${dest}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].term).toBe('Kuala Lumpur, Malaysia');
  });

  it('Test missing text query param returns 400', async () => {
    const res = await request(app).get(`/api/destination/query/`);
    expect(res.status).toBe(400);
  });

  it('Test match multiple destination with edit distance of 2', async () => {
    const dest = 'Malsia';
    const res = await request(app).get(
      `/api/destination/query/${dest}?distance=${2}`
    );
    expect(res.body).toHaveLength(2);
    expect(
      res.body.every((r: Destination) => r.term.includes('Malaysia'))
    ).toBe(true);
  });
});

// Test /api/destination/bounds route
describe('GET /api/destination/bounds?minLat={}&maxLat={}&minLng={}&maxLng={}', () => {
  it('Test lng lat worst robust boundary points', async () => {
    const bounds = {
      minLat: 1.512,
      maxLat: 2.512,
      minLng: 3.511,
      maxLng: 4.511,
    };

    const testDestinations = generateRobustWorstBoundaryCases(
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
    } finally {
      await deleteTestDestinations();
    }
  }, 60000);
});
