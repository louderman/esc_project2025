import path from 'path';
import { existsSync, rmSync } from 'fs';

function deleteCoverageFolder() {
  const coveragePath = path.join(__dirname, 'coverage');
  if (existsSync(coveragePath)) {
    rmSync(coveragePath, { recursive: true, force: true });
  }
}

export default function () {
  deleteCoverageFolder();
}
