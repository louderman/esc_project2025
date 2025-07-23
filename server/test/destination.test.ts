import request from 'supertest';
import { cleanup } from '../database/db';
import app from '../app';

afterAll(async () => {
  await cleanup();
});

describe('GET /api/destination/random?count={count}', () => {
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
});
