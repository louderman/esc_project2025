import { Destination } from '../../../types/Destination';
import { pool } from '../../database/db';
import { tableName } from '../../models/destinationModel';

export async function insertTestDestinations(destinations: Destination[]) {
  // First clear any existing test data
  await deleteTestDestinations();
  
  console.log(`Attempting to insert ${destinations.length} test destinations`);
  
  for (const dest of destinations) {
    try {
      await pool.query(
        `INSERT INTO ${tableName} (dest_id, term, lat, lng, type, state)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dest.dest_id, dest.term, dest.lat, dest.lng, dest.type, dest.state]
      );
    } catch (error) {
      console.error('Error inserting destination:', dest, error);
      throw error;
    }
  }
  
  console.log(`Successfully inserted ${destinations.length} test destinations`);
}

export async function deleteTestDestinations(prefix = 'Test_') {
  await pool.query(
    `DELETE FROM ${tableName} WHERE dest_id LIKE ?`,
    [`${prefix}%`]
  );
}

export async function withTestDestinations(testDestinations: Destination[]) {
  beforeAll(async () => {
    await deleteTestDestinations(); // Ensure clean state
    await insertTestDestinations(testDestinations);
  });
  afterAll(async () => await deleteTestDestinations());
}
