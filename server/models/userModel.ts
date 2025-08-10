import { pool } from '../database/db';

const tableName = 'users';
// CREATE TABLE IF NOT EXISTS Users (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL UNIQUE,password VARCHAR(255) NOT NULL);

function sync() {
  return pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `);
}

function insertUser(name: string, email: string, password: string) {
  // Trim and validate inputs
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    throw new Error("All fields (name, email, password) must be non-empty and trimmed.");
  }

  return pool.query(
    `INSERT INTO ${tableName} (name, email, password) VALUES (?, ?, ?)`,
    [trimmedName, trimmedEmail, trimmedPassword]
  );
}


function findByEmail(email: string) {
  const trimmedEmail = email?.trim();

  if (!trimmedEmail) {
    return Promise.resolve(null); // Return null for empty input
  }

  return pool
    .query(`SELECT * FROM ${tableName} WHERE email = ? LIMIT 1`, [trimmedEmail])
    .then(([rows]: any) => {
      if (rows.length > 0) return rows[0];
      return null;
    });
}


export { sync, insertUser, findByEmail };
