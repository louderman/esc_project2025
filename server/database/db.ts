import { createPool } from 'mysql2';

const pool = createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'hotel',
}).promise();

// const pool = createPool({
//   host: 'localhost',
//   port: 3306,
//   user: 'ItsMeOX',
//   password: 'password',
//   database: process.env.NODE_ENV === 'test' ? 'hotel_test' : 'ESC',
// }).promise();

async function cleanup() {
  await pool.end();
}

export { pool, cleanup };

// CREATE USER 'your_username'@'your_host' IDENTIFIED BY 'your_password';
// GRANT ALL PRIVILEGES ON db_name.* TO 'your_username'@'localhost';
// FLUSH PRIVILEGES;
