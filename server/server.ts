import process from 'process';
import { cleanup } from './database/db';

import { sync as syncDest } from './models/destination';
import { sync as syncUser } from './models/userModel';
import app from './app';

// I have to separate server.ts into
// app.ts and server.ts
// for testing (app.listen() shouldnt be invoked during tests)

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

syncDest();
syncUser();

app.listen(5000, () => {
  console.log('Server listening on port 5000.');
});
