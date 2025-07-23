import request from 'supertest';
import { cleanup } from '../database/db';
import app from '../app';
jest.mock('../models/destination');
import { getRandomDestinations } from '../models/destination';
import { Destination } from '../../types/Destination';

const mockedGetRandomDestinations = getRandomDestinations as jest.Mock; // <- Step 2
const mockDestination: Destination = {
  dest_id: '1',
  id: '1',
  lat: 0,
  lng: 0,
  state: 'state',
  term: 'term',
  type: '2',
};

describe('GET /api/destination/random?count={count}', () => {
  beforeEach(() => {
    mockedGetRandomDestinations.mockResolvedValue(
      Array(5).fill(mockDestination)
    );
  });

  it('Test returned destination length matches count', async () => {
    const res = await request(app).get('/api/destination/random?count=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });
  it('Test zero return count', async () => {
    const res = await request(app).get('/api/destination/random?count=0');
    expect(res.statusCode).toBe(400);
  });
  it('Test negative return count', async () => {
    const res = await request(app).get('/api/destination/random?count=-1');
    expect(res.statusCode).toBe(400);
  });
  it('Test invalid return count', async () => {
    const res = await request(app).get('/api/destination/random?count=abc');
    expect(res.statusCode).toBe(400);
  });
  it('Test missing return count', async () => {
    const res = await request(app).get('/api/destination/random');
    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await cleanup();
  });
});
