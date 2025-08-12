process.env.NODE_ENV = 'test';

import app from '../../server';
import { pool } from '../../database/db';
import { sync as syncUser } from '../../models/userModel';
import type { AddressInfo } from 'net';
import http from 'http';

const USERS = 'users';

let server: http.Server;
let baseURL: string;

async function postJSON(path: string, body: any) {
  const res = await fetch(`${baseURL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

describe('Integration: Auth Router (no supertest)', () => {
  beforeAll(async () => {
    // Make sure table exists
    await syncUser();

    // Start a real HTTP server
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const addr = server.address() as AddressInfo;
    baseURL = `http://127.0.0.1:${addr.port}`;
  });

  beforeEach(async () => {
    await pool.query(`DELETE FROM ${USERS};`);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM ${USERS};`);
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  });

  // ITC_AUTHROUTER_1: Register
  describe('ITC_AUTHROUTER_1 - Register user via /api/auth/register', () => {
    const body = { name: 'Shawn', email: 'Shawn@gmail.com', password: 'Shawn@123' };

    test('Valid input → 201 + {message:"User registered successfully."}', async () => {
      const res = await postJSON('/api/auth/register', body);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully.');

      const [rows]: any = await pool.query(`SELECT * FROM ${USERS} WHERE email=?`, [body.email]);
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('Shawn');
    });

    test('Duplicate email → 400 + {message:"Email already exists."}', async () => {
      await postJSON('/api/auth/register', body);
      const res = await postJSON('/api/auth/register', body);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email already exists.');
    });

    test('Empty name → 400 + {message:"All fields are required."}', async () => {
      const res = await postJSON('/api/auth/register', { ...body, name: '' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required.');
    });
  });

  // ITC_AUTHROUTER_2: Login
  describe('ITC_AUTHROUTER_2 - Login via /api/auth/login', () => {
    const user = { name: 'Shawn', email: 'Shawn@gmail.com', password: 'Shawn@123' };

    beforeEach(async () => {
      const res = await postJSON('/api/auth/register', user);
      expect(res.status).toBe(201);
    });

    test('Correct credentials → 200 + {message,userId,name}', async () => {
      const res = await postJSON('/api/auth/login', { email: user.email, password: user.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful.');
      expect(res.body).toHaveProperty('userId');
      expect(typeof res.body.userId).toBe('number');
      expect(res.body).toHaveProperty('name', user.name);
    });

    test('Wrong credentials → 401 + {message:"Invalid email or password."}', async () => {
      const res = await postJSON('/api/auth/login', {
        email: 'Wrong@gmail.com',
        password: 'Wrongn@123',
      });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password.');
    });
  });
});
