import { cleanup, pool } from './database/db';

async function truncateTables() {
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

export default async function jestGlobalTeardown() {
  await truncateTables();
  await cleanup();
}
