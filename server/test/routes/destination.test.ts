import request from 'supertest';
import { cleanup } from '../../database/db';
jest.mock('../../models/destinationModel', () => {
  return {
    ...jest.requireActual('../../models/destinationModel'),
    getRandomDestinations: jest.fn(),
  };
});
import { getRandomDestinations } from '../../models/destinationModel';
import { Destination } from '../../../types/Destination';
import app from '../../server';

// Test /api/destination/random route
describe('GET /api/destination/random?count={}', () => {
  const mockedGetRandomDestinations = getRandomDestinations as jest.Mock;
  const mockDestination: Destination = {
    dest_id: '1',
    id: '1',
    lat: 0,
    lng: 0,
    state: 'state',
    term: 'term',
    type: '2',
  };

  beforeEach(() => {
    mockedGetRandomDestinations.mockResolvedValue(
      Array(5).fill(mockDestination)
    );
  });

  it('should have returned destination length equals to count param', async () => {
    const res = await request(app).get('/api/destination/random?count=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });
  it('should throw status 400 on zero count', async () => {
    const res = await request(app).get('/api/destination/random?count=0');
    expect(res.statusCode).toBe(400);
  });
  it('should throw status 40 on negative count', async () => {
    const res = await request(app).get('/api/destination/random?count=-1');
    expect(res.statusCode).toBe(400);
  });
  it('should throw status 400 on non-numeric count', async () => {
    const res = await request(app).get('/api/destination/random?count=abc');
    expect(res.statusCode).toBe(400);
  });
  it('should throw status 400 on non-numeric count on missing return count', async () => {
    const res = await request(app).get('/api/destination/random');
    expect(res.statusCode).toBe(400);
  });
});

// // Test /api/destination/all route
// describe('GET /api/destination/all', () => {
//   it('should return all destinations', async () => {});
// });

// // Test /api/destination/query route
// describe('GET /api/destination/query/:text', () => {
//   it('should return fuzzy matched ...', async () => {});
// });

// // Test /api/destination/bounds route
// describe('GET /api/destination/bounds?minLat={}&maxLat={}&minLng={}&maxLng={}', () => {
//   it('should return fuzzy matched ...', async () => {});
// });
