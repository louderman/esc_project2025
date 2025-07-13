import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: 'back.r3po.org',
  port: 53042,
  user: 'pub',
  password: 'asbestosSnOrter8&',
  database: 'hotel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool };