// const mysql = require('mysql2');
import { createPool } from 'mysql2';

const pool = createPool({
  host: 'localhost',
  user: '[YourUserName]',
  password: '[YourPassword]',
  database: '[YourDbName]',
}).promise();

async function cleanup() {
  await pool.end();
}

export { pool, cleanup };
