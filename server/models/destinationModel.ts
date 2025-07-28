import { pool } from '../database/db';
import { type Destination } from '../../types/Destination';
import { FieldPacket } from 'mysql2';

const tableName = 'destination';
// CREATE TABLE Destination (id INT AUTO_INCREMENT PRIMARY KEY, dest_id VARCHAR(4), term VARCHAR(255), lat FLOAT, lng FLOAT, type VARCHAR(100));
/**
 *  +----+---------+-------------+---------+---------+------+-------+
 *  | id | dest_id | term        | lat     | lng     | type | state |
 *  +----+---------+-------------+---------+---------+------+-------+
 */

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

async function sync() {
  return await pool.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        dest_id VARCHAR(10), 
        term VARCHAR(255), 
        lat FLOAT, 
        lng FLOAT, 
        type VARCHAR(100), 
        state VARCHAR(100)
    );`
  );
}

async function getAllDestinations() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM ${tableName};
      `);
    return rows as Destination[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getRandomDestinations(count: number) {
  try {
    if (count <= 0) {
      return [];
    }

    const [rows] = await pool.query(
      `
      SELECT * FROM ${tableName}
      ORDER BY RAND()
      LIMIT ?;
      `,
      [count]
    );
    return rows as Destination[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function searchDestinations(
  text: string,
  distanceThresh: number = 2,
  returnCount: number = 10
) {
  try {
    // First finds destinations where `term` contains the input `text` as a substring.
    const [rows] = (await pool.query(
      `
        SELECT * FROM destination
        WHERE term LIKE ?
        LIMIT ${returnCount}
    `,
      [`%${text}%`]
    )) as [Destination[], FieldPacket[]];

    // If found rows are lesser than `returnCount`, then
    if (rows.length < returnCount) {
      // Get every destinations and do fuzzy matching with edit distance dp
      const allRows = await getAllDestinations();
      const textParts = text.toLowerCase().split(/[\s,]+/); // Split user input by comma
      
      for (let i = 0; i < allRows.length && rows.length < returnCount; i++) {
        const row = allRows[i];
        const included = rows.some((r) => r.id === row.id);
        if (!row.term || included) {
          continue;
        }

        // Split db destination data by comma too and
        // try to match with each user input text part
        // by checking if every user input text part has edit distance <= `distanceThresh`
        // relative to any db destination data text part
        const rowParts = row.term.toLowerCase().split(/[\s,]+/);
        const isFuzzyMatch = textParts.every((userWord) =>
          rowParts.some((p) => {
            const distance = editDistance(p, userWord);
            return distance <= distanceThresh;
          })
        );

        if (isFuzzyMatch) {
          rows.push(row);
        }
      }
    }

    // Return only up to returnCount items
    return rows.slice(0, returnCount);
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function searchDestinationsInBounds({
  minLat,
  maxLat,
  minLng,
  maxLng,
}: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}) {
  [minLat, maxLat] = minLat < maxLat ? [minLat, maxLat] : [maxLat, minLat];
  [minLng, maxLng] = minLng < maxLng ? [minLng, maxLng] : [maxLng, minLng];

  // Add small epsilon to handle floating-point precision issues
  const epsilon = 0.0001;
  const [rows] = (await pool.query(
    `
        SELECT * FROM destination
        WHERE lat >= ? AND lat <= ? AND lng >= ? AND lng <= ?;
    `,
    [minLat - epsilon, maxLat + epsilon, minLng - epsilon, maxLng + epsilon]
  )) as [Destination[], FieldPacket[]];

  return rows;
}

// Aliases for backward compatibility
const all = getAllDestinations;
const random = getRandomDestinations;
const query = searchDestinations;

export {
  tableName,
  editDistance,
  sync,
  getAllDestinations,
  getRandomDestinations,
  searchDestinations,
  searchDestinationsInBounds,
  // Aliases for backward compatibility
  all,
  random,
  query,
};
