import { pool } from './database/db';

async function truncateTables() {
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
}

beforeAll(async () => {
  await truncateTables();
});

afterAll(async () => {
  await truncateTables();
  // Cleanup is now handled in globalTeardown
});
