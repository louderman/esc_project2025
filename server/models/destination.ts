import { pool } from '../database/db';
import { type Destination } from '../../types/Destination';

async function all() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Destination;
      `);
    return rows as Destination[];
  } catch (e) {
    console.error(e);
  }
}

export { all };
