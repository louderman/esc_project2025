import fs from 'fs';
import path from 'path';
import { cleanup } from './database/db';

export default async () => {
  await cleanup(); // <-- close the pool ONCE here

  // (optional) delete coverage if you want
  const coveragePath = path.join(__dirname, 'coverage');
  if (fs.existsSync(coveragePath)) fs.rmSync(coveragePath, { recursive: true, force: true });
};
