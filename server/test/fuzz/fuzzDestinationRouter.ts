import express from 'express';
import * as destModel from '../../models/destinationModel';
import { router as destinationRouter } from '../../routes/destinationRouter';
import request from 'supertest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

const reportPath = path.join(__dirname, 'fuzz_report.csv');
fs.writeFileSync(reportPath, 'iteration,timestamp,route,params,status,error\n');

// Mock DB calls to avoid hitting real database
(destModel.getAllDestinations as any) = async () => [{ id: 1 }];
(destModel.getRandomDestinations as any) = async (count: number) =>
  Array(count).fill({ id: 1 });
(destModel.searchDestinationsByName as any) = async () => [{ id: 'test-name' }];
(destModel.searchDestinationsByDestId as any) = async () => [{ id: 'test-id' }];
(destModel.searchDestinationsInBounds as any) = async () => [
  { id: 'test-bounds' },
];

const app = express();
app.use('/api/destination', destinationRouter);
const agent = request.agent(app);

const endTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
console.log('Expected end time: ', endTime);
let iteration = 0;

async function fuzzOnce() {
  iteration++;

  const routeChoice = Math.floor(Math.random() * 5);
  let route = '';
  let params = '';
  let status = 'PASS';
  let errorMsg = '';

  try {
    if (routeChoice === 0) {
      const [count] = fc.sample(fc.integer({ min: -1000, max: 1000 }), 1);
      route = '/api/destination/random';
      params = `count=${count}`;
      await agent.get(`${route}?${params}`);
    } else if (routeChoice === 1) {
      const [text] = fc.sample(fc.string({ maxLength: 100 }), 1);
      route = '/api/destination/query/name';
      params = text;
      await agent.get(`${route}/${encodeURIComponent(text)}`);
    } else if (routeChoice === 2) {
      const [destId] = fc.sample(fc.string({ maxLength: 50 }), 1);
      route = '/api/destination/query/destId';
      params = destId;
      await agent.get(`${route}/${encodeURIComponent(destId)}`);
    } else if (routeChoice === 3) {
      const [minLat] = fc.sample(fc.float(), 1);
      const [maxLat] = fc.sample(fc.float(), 1);
      const [minLng] = fc.sample(fc.float(), 1);
      const [maxLng] = fc.sample(fc.float(), 1);
      route = '/api/destination/bounds';
      params = `minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`;
      await agent.get(`${route}?${params}`);
    } else {
      route = '/api/destination/all';
      params = '';
      await agent.get(route);
    }
  } catch (err: any) {
    status = 'FAIL';
    errorMsg = (err?.message || '').replace(/\n/g, ' ');
    console.error('Crash on iteration', iteration, err);
  }

  // Append row to CSV
  const row = `${iteration},${new Date().toISOString()},${route},${JSON.stringify(
    params
  )},${status},"${errorMsg}"\n`;
  fs.appendFileSync(reportPath, row);

  if (iteration % 1000 === 0) {
    console.log(`[${new Date().toISOString()}] Iterations: ${iteration}`);
  }

  await new Promise((r) => setTimeout(r, 1));
}

(async function runFuzz() {
  console.log('Starting 24-hour fuzzing session...');
  while (Date.now() < endTime) {
    await fuzzOnce();
  }
  console.log('Fuzzing finished.');
})();
