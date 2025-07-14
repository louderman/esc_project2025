import { pool } from './database/db';

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Connected to the database!');
    console.log(rows);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    await pool.end();
  }
}

testConnection();