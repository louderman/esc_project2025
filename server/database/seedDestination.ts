import { readFileSync } from 'fs';
import { pool } from './db';

const DESTINATION_JSON_PATH = './public/destinations.json';

type Destination = {
  term: string;
  uid: string;
  lat: number;
  lng: number;
  type: string;
  state: string;
};

const raw = readFileSync(DESTINATION_JSON_PATH, 'utf-8');
const obj: Destination[] = JSON.parse(raw);
console.log(obj.length);

async function seed() {
  await pool.query(`TRUNCATE TABLE Destination`);

  for (let o of obj) {
    await pool.query(
      `
        INSERT INTO Destination (dest_id, term, lat, lng, type) VALUES (?, ?, ?, ?, ?)
        `,
      [o.uid, o.term, o.lat, o.lng, o.type]
    );
  }

  console.log('Seed succeed.');
}

// CREATE TABLE Destination (id INT AUTO_INCREMENT PRIMARY KEY, dest_id VARCHAR(4), term VARCHAR(255), lat FLOAT, lng FLOAT, type VARCHAR(100));
seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
