import request from 'supertest';
import app from '../../server';

// Test /api/hotel/query?dest_id={}
describe('Test /api/hotel/query?dest_id={}', () => {
  it('Test returns 400 on empty dest_id', async () => {
    const res = await request(app).get(`/api/hotel/query`);
    expect(res.status).toBe(400);
  }, 10000);

  it('Test fetch hotel from Ascenda API', async () => {
    const res = await request(app).get(`/api/hotel/query?dest_id=RsBU`);
    expect(res.status).toBe(200);
  }, 10000);
});
