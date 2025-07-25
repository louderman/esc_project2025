import request from 'supertest';
import {
  getRandomDestinations,
  tableName,
} from '../../models/destinationModel';
import { Destination } from '../../../types/Destination';
import app from '../../server';
import { pool } from '../../database/db';

// Test /api/destination/random route
describe('GET /api/destination/random?count={}', () => {
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
  it('should have returned destination length equals to count param', async () => {
    const res = await request(app).get('/api/destination/random?count=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });
  it('should throw status 400 on zero count', async () => {
    const res = await request(app).get('/api/destination/random?count=0');
    expect(res.statusCode).toBe(400);
  });
  it('should throw status 400 on negative count', async () => {
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
