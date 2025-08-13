import { cleanup } from './database/db';

export default async function () {
  await cleanup();
}
