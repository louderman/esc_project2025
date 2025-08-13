import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'hotel',
});

let isPoolClosed = false;

async function cleanup() {
  if (isPoolClosed) {
    console.log('Pool already closed, skipping cleanup.');
    return;
  }

  try {
    console.log('Closing database pool...');
    isPoolClosed = true;
    
    // Wait a bit for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check if pool is already closed before trying to end it
    if (pool && typeof pool.end === 'function') {
      await pool.end();
      console.log('Database pool closed successfully.');
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
    } else {
      console.log('Pool was already closed.');
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
