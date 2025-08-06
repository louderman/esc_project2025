import { cleanup, pool } from './database/db';
import { sync as syncBookings } from './models/bookingModel';

async function truncateTables() {
  // TODO: probably should add prefix `test_` to tables?
  // I think it's too risky to have same table name for both production and test db
  try {
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
  }
}

async function setupTables() {
  try {
    // Drop and recreate bookings table to ensure it has the latest schema
    await pool.query(`DROP TABLE IF EXISTS bookings;`);
    await syncBookings();
  } catch (error) {
    console.error('Error setting up tables:', error);
    throw error;
  }
}

beforeAll(async () => {
  await setupTables();
  await truncateTables();
});

afterAll(async () => {
  await truncateTables();
  await cleanup();
});

beforeEach(async () => {
  // Clean up bookings table before each test to ensure isolation
  try {
    await pool.query(`TRUNCATE TABLE bookings;`);
  } catch (error) {
    console.error('Error cleaning bookings table:', error);
  }
});
