import { readFileSync } from 'fs';
import { pool } from './db';
import { type Destination } from '../../types/Destination';
import { sync, tableName } from '../models/destination';

const DESTINATION_JSON_PATH = './public/destinations.json';

const raw = readFileSync(DESTINATION_JSON_PATH, 'utf-8');
const obj: Destination[] = JSON.parse(raw);
console.log(obj.length);

async function seed() {
  // Create table if not exists
  await sync();

  // Remove all rows
  await pool.query(`TRUNCATE TABLE ${tableName}`);

  // Seed the table with destinations
  for (let o of obj) {
    await pool.query(
      `
        INSERT INTO ${tableName} (dest_id, term, lat, lng, type, state) VALUES (?, ?, ?, ?, ?, ?)
        `,
      [o.uid, o.term, o.lat, o.lng, o.type, o.state]
    );
  }

  console.log('Seed succeed.');
  process.exit();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit();
});