import { createPool } from 'mysql2';

// Create a connection pool to the database
const pool = createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'hotel',
}).promise();

async function cleanup() {
  try {
    await pool.end();
    console.log('Database pool closed.');
  } catch (err) {
    console.error('Error closing pool:', err);
  }
}

export { pool, cleanup };
