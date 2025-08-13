import { pool } from './database/db';

export default async function () {
  const [tables] = await pool.query(`SHOW TABLES;`);
  const tableNames = (tables as any[]).map((row) => Object.values(row)[0]);

  if (tableNames.length > 0) {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
    for (const table of tableNames) {
      await pool.query(`TRUNCATE TABLE \`${table}\`;`);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
}
