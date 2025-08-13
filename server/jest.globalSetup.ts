import dotenv from 'dotenv';

// Load environment variables before importing database
dotenv.config();

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

import { cleanup, pool } from './database/db';

async function truncateTables() {
  try {
    // TODO: probably should add prefix `test_` to tables?
    // I think it's too risky to have same table name for both production and test db
    const [tables] = await pool.query(`SHOW TABLES;`);
    const tableNames = (tables as unknown as string[]).map(
      (row) => Object.values(row)[0]
    );
    await pool.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    for (const table of tableNames) {
      await pool.query(`TRUNCATE TABLE \`${table}\`;`);
    }
    await pool.query(`SET FOREIGN_KEY_CHECKS = 1;`);
  } catch (error) {
    console.error('Error truncating tables:', error);
    throw error;
  }
}

beforeAll(async () => {
  try {
    await truncateTables();
  } catch (error) {
    console.error('Error in beforeAll setup:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await truncateTables();
    await cleanup();
  } catch (error) {
    console.error('Error in afterAll cleanup:', error);
    // Don't throw here to avoid masking test results
  }
});
