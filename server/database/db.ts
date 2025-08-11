import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'hotel',
});

async function cleanup() {
  try {
    // Check if pool is already closed before trying to end it
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  } catch (err) {
    // Only log if it's not a "pool already closed" error
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code !== 'POOL_CLOSED'
    ) {
      console.error('Error closing pool:', err);
    }
  }
}

process.on('SIGINT', async () => {
  console.log('\nClosing MySQL pool...');
  try {
    await cleanup();
    console.log('MySQL pool closed. Exiting process.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MySQL pool:', err);
    process.exit(1);
  }
});

export { cleanup, pool };

// CREATE USER 'your_username'@'your_host' IDENTIFIED BY 'your_password';
// GRANT ALL PRIVILEGES ON db_name.* TO 'your_username'@'localhost';
// FLUSH PRIVILEGES;
