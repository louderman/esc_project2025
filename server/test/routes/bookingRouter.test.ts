
import express from 'express';
import request from 'supertest';

type Mocks = {
  model: {
    createBooking: jest.Mock;
    getBookingById: jest.Mock;
    updateBooking: jest.Mock;
  };
  stripePI?: { create: jest.Mock; confirm: jest.Mock };
  app: express.Express;
};

function build(withStripe: boolean): Mocks {
  jest.resetModules();
  process.env.STRIPE_SECRET_KEY = withStripe ? 'sk_test_123' : '';

  const model = {
    createBooking: jest.fn(),
    getBookingById: jest.fn(),
    updateBooking: jest.fn(),
  };
  jest.doMock('../../models/bookingModel', () => model);

  let stripePI: { create: jest.Mock; confirm: jest.Mock } | undefined;
  jest.doMock('stripe', () => {
    const pi = { create: jest.fn(), confirm: jest.fn() };
    stripePI = pi;
    const Ctor = jest.fn(() => ({ paymentIntents: pi }));
    return { __esModule: true, default: Ctor };
  });

  const { router } = require('../../routes/bookingRouter');
  const app = express();
  app.use(express.json());
  app.use('/api/bookings', router);
  return { model, stripePI, app };
}

describe('bookingRouter', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('503 on /create-payment-intent when Stripe key is missing', async () => {
    const { app } = build(false);
    const res = await request(app)
      .post('/api/bookings/create-payment-intent')
      .send({ bookingId: 'b1', paymentIntentId: 'pm_1', amount: 100 });
    expect(res.status).toBe(503);
  });

  it('returns client secret from /create-payment-intent', async () => {
    const { app, stripePI } = build(true);
    stripePI!.create.mockResolvedValue({
      id: 'pi_123',
      status: 'requires_action',
      client_secret: 'secret_123',
      next_action: { type: 'use_stripe_sdk' },
    });

    const res = await request(app)
      .post('/api/bookings/create-payment-intent')
      .send({ bookingId: 'b1', paymentIntentId: 'pm_123', amount: 545 });

    expect(res.status).toBe(200);
    expect(stripePI!.create).toHaveBeenCalled();
    expect(res.body).toEqual(
      expect.objectContaining({
        requires_action: true,
        payment_intent: expect.objectContaining({
          id: 'pi_123',
          client_secret: 'secret_123',
        }),
      }),
    );
  });

  it('400/500 on /create-payment-intent when required fields are missing/invalid', async () => {
    const { app } = build(true);

    const cases = [
      {}, // nothing
      { bookingId: 'b1' },
      { bookingId: 'b1', paymentIntentId: 'pm_123' },
      { bookingId: 'b1', paymentIntentId: 'pm_123', amount: -10 },
      { bookingId: '', paymentIntentId: 'pm_123', amount: 100 },
    ];

    for (const payload of cases) {
      const res = await request(app)
        .post('/api/bookings/create-payment-intent')
        .send(payload as any);

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThanOrEqual(500);

      const isJson = (res.headers['content-type'] || '').includes('application/json');
      if (isJson && res.body && Object.keys(res.body).length) {
        expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
      }
    }
  });

  it('5xx on /create-payment-intent when Stripe create throws', async () => {
    const { app, stripePI } = build(true);
    stripePI!.create.mockRejectedValue(new Error('stripe down'));

    const res = await request(app)
      .post('/api/bookings/create-payment-intent')
      .send({ bookingId: 'b1', paymentIntentId: 'pm_123', amount: 500 });

    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it('confirms payment and updates booking', async () => {
    const { app, model } = build(true);
    model.updateBooking.mockResolvedValue(1);

    const res = await request(app)
      .post('/api/bookings/confirm-payment')
      .send({ bookingId: 'b1', paymentIntentId: 'pi_123' });

    expect(res.status).toBe(200);
    expect(model.updateBooking).toHaveBeenCalledWith('b1', 'pi_123', 'confirmed');
  });

  it('400 on /confirm-payment when fields are missing', async () => {
    const { app } = build(true);

    const cases = [{}, { bookingId: 'b1' }, { paymentIntentId: 'pi_123' }];
    for (const payload of cases) {
      const res = await request(app).post('/api/bookings/confirm-payment').send(payload as any);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    }
  });

  
  it('200 on /confirm-payment when update returns 0 rows', async () => {
    const { app, model } = build(true);
    model.updateBooking.mockResolvedValue(0);

    const res = await request(app)
      .post('/api/bookings/confirm-payment')
      .send({ bookingId: 'nope', paymentIntentId: 'pi_123' });

    expect(res.status).toBe(200);
    expect(model.updateBooking).toHaveBeenCalledWith('nope', 'pi_123', 'confirmed');
  });

  it('5xx on /confirm-payment when model.updateBooking throws', async () => {
    const { app, model } = build(true);
    model.updateBooking.mockRejectedValue(new Error('db error'));

    const res = await request(app)
      .post('/api/bookings/confirm-payment')
      .send({ bookingId: 'b1', paymentIntentId: 'pi_123' });

    expect(res.status).toBeGreaterThanOrEqual(500);
    const isJson = (res.headers['content-type'] || '').includes('application/json');
    if (isJson && res.body && Object.keys(res.body).length) {
      expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    }
  });

  it('GET /:id uses model and returns booking', async () => {
    const { app, model } = build(true);
    model.getBookingById.mockResolvedValue({ id: 'b42', userId: 'u1' });

    const res = await request(app).get('/api/bookings/b42');

    expect(res.status).toBe(200);
    expect(model.getBookingById).toHaveBeenCalledWith('b42');
    expect(res.body).toEqual(expect.objectContaining({ id: 'b42' }));
  });

  it('404 on GET /:id when booking not found', async () => {
    const { app, model } = build(true);
    model.getBookingById.mockResolvedValue(null);

    const res = await request(app).get('/api/bookings/missing');

    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });

  it('5xx on GET /:id when model throws', async () => {
    const { app, model } = build(true);
    model.getBookingById.mockRejectedValue(new Error('db boom'));

    const res = await request(app).get('/api/bookings/oops');

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });
});
