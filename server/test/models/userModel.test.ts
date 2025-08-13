process.env.NODE_ENV = 'test';

import { sync, insertUser, findByEmail } from '../../models/userModel';
import { pool, cleanup } from '../../database/db';
import bcrypt from 'bcrypt';

const tableName = 'users';

jest.setTimeout(20000);

describe('User Model', () => {
  beforeAll(async () => {
    // Precondition: users table exists
    await sync();
  });

  beforeEach(async () => {
    // Start each test with a clean table
    await pool.query(`DELETE FROM ${tableName};`);
  });

  afterAll(async () => {
    // Postcondition: cleanup and close connections
    await pool.query(`DELETE FROM ${tableName};`);
    // await cleanup();
  });

  // TC_USERMODEL_1: insertUser

  test('Input: Non-existing ("Shawn","Shawn@gmail.com","Shawn@123") → Output: Returns ID', async () => {
    const [result]: any = await insertUser(
      'Shawn',
      'Shawn@gmail.com',
      'Shawn@123'
    );
    expect(result).toBeDefined();
    expect(typeof result.insertId).toBe('number');

    // sanity check: row persisted
    const [rows]: any = await pool.query(
      `SELECT * FROM ${tableName} WHERE email=? LIMIT 1`,
      ['Shawn@gmail.com']
    );
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('Shawn');
    expect(rows[0].email).toBe('Shawn@gmail.com');
    expect(await bcrypt.compare(rows[0].password, 'Shawn@123')).toBe(true);
  });

  test('Input: Existing ("Shawn","Shawn@gmail.com","Shawn@123") again → Output: Error due to unique email', async () => {
    await insertUser('Shawn', 'Shawn@gmail.com', 'Shawn@123');

    try {
      await insertUser('Shawn', 'Shawn@gmail.com', 'Shawn@123');
      throw new Error('Expected duplicate insert to reject, but it resolved');
    } catch (e) {
      const err = e as any;
      const isDuplicate =
        (err && err.code === 'ER_DUP_ENTRY') ||
        (err && err.errno === 1062) ||
        /duplicate/i.test(String(err?.message || ''));
      expect(isDuplicate).toBe(true);
    }
  });

  test('Input: One string empty ("", "Shawn@gmail.com", "Shawn@123") → Output: validation error message', () => {
    expect(
      async () => await insertUser('', 'Shawn@gmail.com', 'Shawn@123')
    ).toThrow(
      'All fields (name, email, password) must be non-empty and trimmed.'
    );
  });

  test('Input: Two strings empty ("", "", "Shawn@123") → Output: validation error message', () => {
    expect(async () => await insertUser('', '', 'Shawn@123')).toThrow(
      'All fields (name, email, password) must be non-empty and trimmed.'
    );
  });

  test('Input: All three empty ("", "", "") → Output: validation error message', () => {
    expect(async () => await insertUser('', '', '')).toThrow(
      'All fields (name, email, password) must be non-empty and trimmed.'
    );
  });

  // TC_USERMODEL_2: findByEmail

  test('Input: Existing "Alice@gmail.com" → Output: user object {id,name,email,password}', async () => {
    const [ins]: any = await insertUser(
      'Alice',
      'Alice@gmail.com',
      'Alice@123'
    );
    expect(ins.insertId).toBeDefined();

    const user = await findByEmail('Alice@gmail.com');
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('id');
    expect(typeof user!.id).toBe('number');
    expect(user).toHaveProperty('name', 'Alice');
    expect(user).toHaveProperty('email', 'Alice@gmail.com');
    expect(user).toHaveProperty('password', 'Alice@123');
  });

  test('Input: Non-existing "notAlice@gmail.com" → Output: null', async () => {
    const user = await findByEmail('notAlice@gmail.com');
    expect(user).toBeNull();
  });

  test('Input: Empty string "" → Output: null', async () => {
    const user = await findByEmail('');
    expect(user).toBeNull();
  });
});
