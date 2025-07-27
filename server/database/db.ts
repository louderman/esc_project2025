import mysql from 'mysql2/promise';

// Create a connection pool to the database
const pool = mysql.createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: 'hotel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Cleanup function for graceful shutdown.
 * Only call this if you're shutting down the server (e.g., in SIGINT or test teardown).
 */
async function cleanup() {
  try {
    await pool.end();
    console.log('Database pool closed.');
  } catch (err) {
    console.error('Error closing pool:', err);
  }
}

export { pool, cleanup };
