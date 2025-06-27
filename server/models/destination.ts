import { pool } from '../database/db';
import { type Destination } from '../../types/Destination';
import { FieldPacket } from 'mysql2';

const tableName = 'destination';
// CREATE TABLE Destination (id INT AUTO_INCREMENT PRIMARY KEY, dest_id VARCHAR(4), term VARCHAR(255), lat FLOAT, lng FLOAT, type VARCHAR(100));

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
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        dest_id VARCHAR(4), 
        term VARCHAR(255), 
        lat FLOAT, 
        lng FLOAT, 
        type VARCHAR(100), 
        state VARCHAR(100)
    );`
  );
}

async function all() {
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

async function like(
  text: string,
  distanceThresh: number = 2,
  returnCount: number = 10
) {
  /**
   * Performs a fuzzy search for destinations based on the user's input `text`.
   *
   * Step 1: SQL `LIKE` search
   * - Executes a query: `SELECT * FROM destination WHERE term LIKE '%text%' LIMIT returnCount`
   * - Finds destinations where `term` contains the input `text` as a substring.
   * - Time Complexity: O(N × M)
   *   - N = number of rows in the `destination` table
   *   - M = average length of each `term`
   * - Limitation: Since `LIKE '%text%'` starts with a wildcard, it disables index optimization (causes full table scan).
   *
   * Step 2: Fuzzy match with edit distance
   * - If fewer than `returnCount` results are found:
   *   - Retrieves all rows from the `destination` table.
   *   - Normalizes the input `text` by lowercasing and splitting on whitespace or commas: `/[\s,]+/`
   *   - For each row:
   *     - Skip if it has no `term` or is already in the result set.
   *     - Normalize the row's `term` using the same splitting strategy.
   *     - Perform fuzzy matching by:
   *         - Ensuring every word in the input matches some word in the row’s `term`, where:
   *             - Their lengths differ by at most `distanceThresh`, and
   *             - Their Levenshtein (edit) distance is ≤ `distanceThresh`.
   *   - Matching rows are added until `returnCount` is reached.
   *
   * Time Complexity of fallback: O(N × P × Q × M)
   * - N = number of rows in the table
   * - P = number of parts in the input text
   * - Q = number of parts in each row's term
   * - M = average token length
   */

  try {
    const [rows] = (await pool.query(
      `
        SELECT * FROM destination
        WHERE term LIKE ?
        LIMIT ${returnCount}
    `,
      [`%${text}%`]
    )) as [Destination[], FieldPacket[]];

    if (rows.length < returnCount) {
      const allRows = await all();
      let i = 0;
      const textParts = text.toLowerCase().split(/[\s,]+/);
      while (i < allRows.length && rows.length < returnCount) {
        const row = allRows[i];
        const included = rows.some((r) => r.id === row.id);
        if (!row.term || included) {
          i++;
          continue;
        }

        const rowParts = row.term.toLowerCase().split(/[\s,]+/);
        const isFuzzyMatch = textParts.every((userWord) =>
          rowParts.some(
            (p) =>
              Math.abs(p.length - userWord.length) <= distanceThresh &&
              rowParts.some((p) => editDistance(p, userWord) <= distanceThresh)
          )
        );

        if (isFuzzyMatch) {
          rows.push(row);
        }
        i++;
      }
    }

    return rows;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export { sync, all, like };
