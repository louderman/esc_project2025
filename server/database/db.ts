import { createPool } from 'mysql2/promise'; 

const pool = createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: 'hotel'
}); // Removed .promise() - it's not needed!

async function cleanup() {
  await pool.end();
}

export { pool, cleanup };