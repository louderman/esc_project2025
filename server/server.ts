import express, { Request, Response } from 'express';
import cors from 'cors';
import process from 'process';
import { cleanup } from './database/db';

// import { router as destRouter } from './routes/destination';

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/destination', destRouter);

app.listen(5000, () => {
  console.log('Server listening on port 5000.');
});
