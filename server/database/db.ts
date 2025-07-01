// const mysql = require('mysql2');
import { createPool } from 'mysql2';

const pool = createPool({
  host: 'localhost',
  user: 'ItsMeOX',
  password: 'password',
  database: 'ESC',
}).promise();

async function cleanup() {
  await pool.end();
}

export { pool, cleanup };

// CREATE USER 'your_username'@'your_host' IDENTIFIED BY 'your_password';
// GRANT ALL PRIVILEGES ON db_name.* TO 'your_username'@'localhost';
// FLUSH PRIVILEGES;
