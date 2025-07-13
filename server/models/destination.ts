import { pool } from '../database/db';
import { type Destination } from '../../types/Destination';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const tableName = 'destinations';

// Re-export the Destination type for convenience
export type { Destination } from '../../types/Destination';

// Helper function to convert RowDataPacket to Destination
function toDestination(row: RowDataPacket): Destination {
  return {
    id: row.id,
    term: row.term,
    uid: row.uid,
    lat: row.lat,
    lng: row.lng,
    type: row.type,
    state: row.state
  };
}
// Helper function to calculate edit distance (Levenshtein distance)
function editDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// Initialize the database table
async function sync() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(36) NOT NULL UNIQUE,
        term VARCHAR(255) NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        type VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FULLTEXT INDEX idx_term (term)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(`Table ${tableName} synchronized`);
  } catch (error) {
    console.error(`Error synchronizing table ${tableName}:`, error);
    throw error;
  }
}

// Get all destinations
async function all(): Promise<Destination[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${tableName}`);
    return rows.map(toDestination);
  } catch (error) {
    console.error('Error fetching all destinations:', error);
    throw error;
  }
}

// Get random destinations
async function random(count: number): Promise<Destination[]> {
  if (count <= 0) return [];

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${tableName} ORDER BY RAND() LIMIT ?`,
      [count]
    );
    return rows.map(toDestination);
  } catch (error) {
    console.error(`Error fetching ${count} random destinations:`, error);
    throw error;
  }
}

// Search destinations with fuzzy matching
async function query(
  text: string,
  distanceThresh: number = 2,
  returnCount: number = 10
): Promise<Destination[]> {
  if (!text.trim()) return [];

  try {
    // First try full-text search for better performance
    const [fullTextRows] = await pool.query<RowDataPacket[]>(
      `SELECT *, MATCH(term) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance 
       FROM ${tableName} 
       WHERE MATCH(term) AGAINST(? IN NATURAL LANGUAGE MODE) 
       ORDER BY relevance DESC 
       LIMIT ?`,
      [text, text, returnCount]
    );

    let results = fullTextRows.map(toDestination);

    if (results.length >= returnCount) {
      return results.slice(0, returnCount);
    }

    // Fallback to LIKE search if full-text doesn't return enough results
    const [likeRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${tableName} WHERE term LIKE ? LIMIT ?`,
      [`%${text}%`, returnCount]
    );

    results = [...new Set([...results, ...likeRows.map(toDestination)])];

    // If we still don't have enough results, use fuzzy matching
    if (results.length < returnCount) {
      const allDestinations = await all();
      const textParts = text.toLowerCase().split(/[\s,]+/).filter(Boolean);

      for (const destination of allDestinations) {
        if (results.length >= returnCount) break;
        if (!destination.term || results.some(r => r.id === destination.id)) {
          continue;
        }

        const termParts = destination.term.toLowerCase().split(/[\s,]+/).filter(Boolean);
        const isMatch = textParts.every(userWord => 
          termParts.some(termWord => 
            Math.abs(termWord.length - userWord.length) <= distanceThresh &&
            editDistance(termWord, userWord) <= distanceThresh
          )
        );

        if (isMatch) {
          results.push(destination);
        }
      }
    }

    return results.slice(0, returnCount);
  } catch (error) {
    console.error('Error querying destinations:', error);
    throw error;
  }
}

// Get destination by ID
async function getById(id: number): Promise<Destination | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? toDestination(rows[0]) : null;
  } catch (error) {
    console.error(`Error fetching destination with ID ${id}:`, error);
    throw error;
  }
}

// Get destination by UID
async function getByUid(uid: string): Promise<Destination | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${tableName} WHERE uid = ?`,
      [uid]
    );
    return rows.length > 0 ? toDestination(rows[0]) : null;
  } catch (error) {
    console.error(`Error fetching destination with UID ${uid}:`, error);
    throw error;
  }
}

// Create a new destination
async function create(destination: Omit<Destination, 'id'>): Promise<Destination> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${tableName} (uid, term, lat, lng, type, state) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [destination.uid, destination.term, destination.lat, 
       destination.lng, destination.type, destination.state]
    );
    
    const createdDestination = await getById(result.insertId);
    if (!createdDestination) {
      throw new Error('Failed to retrieve created destination');
    }
    return createdDestination;
  } catch (error) {
    console.error('Error creating destination:', error);
    throw error;
  }
}

export { 
  sync, 
  all, 
  random, 
  query, 
  getById, 
  getByUid, 
  create 
};