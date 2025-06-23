import express, { Request, Response } from 'express';
const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ test: ['test1', 'test2'] });
});

app.listen(5000, () => {
  console.log('Server listening on port 5000.');
});
