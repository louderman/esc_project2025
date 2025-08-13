import { existsSync, rmSync } from 'fs';
import path from 'path';
import { cleanup } from './database/db';

function deleteCoverageFolder() {
  const coveragePath = path.join(__dirname, 'coverage');
  if (existsSync(coveragePath)) {
    rmSync(coveragePath, { recursive: true, force: true });
  }
}

export default async function globalTeardown() {
  console.log('Running global teardown...');
  
  // Give any pending database operations time to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    await cleanup();
    console.log('Database cleanup completed.');
  } catch (error) {
    console.log('Database cleanup error (may be expected):', error);
  }
  
  deleteCoverageFolder();
  console.log('Global teardown completed.');
}
