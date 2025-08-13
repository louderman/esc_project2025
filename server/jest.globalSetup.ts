import { pool } from './database/db';

export default async () => {
  // create the pool implicitly by importing, then clean DB once
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
  const [tables]: any = await pool.query('SHOW TABLES;');
  const names = tables.map((r: any) => Object.values(r)[0]);
  for (const t of names) await pool.query(`TRUNCATE TABLE \`${t}\`;`);
  await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
};
