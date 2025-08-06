import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'hotel',
});
// const pool = await cpool.getConnection();

// const pool = createPool({
//   host: 'localhost',
//   port: 3306,
//   user: 'ItsMeOX',
//   password: 'password',
//   database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'ESC',
// }).promise();

async function cleanup() {
  await pool.end();
  // console.log('run', pool);
  // pool.destroy();
  // await pool.end();
  // process.close();
}

process.on('SIGINT', async () => {
  console.log('\nClosing MySQL pool...');
  try {
    await pool.end();
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
