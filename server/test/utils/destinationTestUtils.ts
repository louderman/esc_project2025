import { Destination } from '../../../types/Destination';
import { pool } from '../../database/db';
import { tableName } from '../../models/destinationModel';

export async function insertTestDestinations(destinations: Destination[]) {
  for (const dest of destinations) {
    await pool.query(
      `INSERT INTO ${tableName} (dest_id, term, lat, lng, type, state)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dest.dest_id, dest.term, dest.lat, dest.lng, dest.type, dest.state]
    );
  }
}

export async function deleteTestDestinations(prefix = 'test_') {
  await pool.query(
    `DELETE FROM ${tableName} WHERE LOWER(dest_id) LIKE LOWER(?)`,
    [`${prefix}%`]
  );
}

export async function withTestDestinations(testDestinations: Destination[]) {
  beforeAll(async () => await insertTestDestinations(testDestinations));
  afterAll(async () => await deleteTestDestinations());
}