import request from 'supertest';
import app from '../../server';

// Test /api/hotel-price/query?dest_id={}&checkin={}&checkout={}&guests={}
describe('Test /api/hotel-price/query?dest_id={}&checkin={}&checkout={}&guests={}', () => {
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  const today = new Date();
  const checkinDate = new Date(today);
  checkinDate.setDate(today.getDate() + 1);
  const checkin = formatDate(checkinDate);

  const checkoutDate = new Date(today);
  checkoutDate.setDate(today.getDate() + 2);
  const checkout = formatDate(checkoutDate);

  it('Test returns 400 on empty dest_id', async () => {
    const res = await request(app).get(
      `/api/hotel-price/query?checkin=${checkin}&checkout=${checkout}&guests=1`
    );
    expect(res.status).toBe(400);
  });

  it('Test returns 400 on empty checkin date', async () => {
    const res = await request(app).get(
      `/api/hotel-price/query?dest_id=RsBU&checkout=${checkout}&guests=1`
    );
    expect(res.status).toBe(400);
  });

  it('Test returns 400 on empty checkout date', async () => {
    const res = await request(app).get(
      `/api/hotel-price/query?dest_id=RsBU&checkin=${checkin}&guests=1`
    );
    expect(res.status).toBe(400);
  });

  it('Test returns 400 on empty guest count', async () => {
    const res = await request(app).get(
      `/api/hotel-price/query?dest_id=RsBU&checkin=${checkin}&checkout=${checkout}`
    );
    expect(res.status).toBe(400);
  });

  it('Test fetch hotel from Ascenda API', async () => {
    const res = await request(app).get(
      `/api/hotel-price/query?dest_id=RsBU&checkin=${checkin}&checkout=${checkout}&guests=1`
    );
    expect(res.status).toBe(200);
  }, 20000);
});
