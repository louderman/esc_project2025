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
    // Check if pool is already closed before trying to end it
    if (pool && typeof pool.end === 'function') {
      await pool.end();
      console.log('Database pool closed.');
    }
  } catch (err) {
    // Only log if it's not a "pool already closed" error
    if (err && typeof err === 'object' && 'code' in err && err.code !== 'POOL_CLOSED') {
      console.error('Error closing pool:', err);
    }
  }
}

export { pool, cleanup };