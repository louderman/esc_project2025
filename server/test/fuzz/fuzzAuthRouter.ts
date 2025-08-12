import express from 'express';
import request from 'supertest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import * as userModel from '../../models/userModel';
import { router as authRouter } from '../../routes/authRouter';

// CSV report setup
const reportPath = path.join(__dirname, 'fuzz_auth_report.csv');
if (!fs.existsSync(reportPath)) {
  fs.writeFileSync(
    reportPath,
    'iteration,timestamp,route,payload,status,httpStatus,error\n'
  );
}

type UserRec = { id: number; name: string; email: string; password: string };

let users: UserRec[] = [];
let idSeq = 1;

const findByEmail = async (email: string) =>
  users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;

const createUser = async (name: string, email: string, password: string) => {
  const id = idSeq++;
  users.push({ id, name, email, password });
  return id;
};

const checkPassword = async (email: string, pwd: string) => {
  const u = await findByEmail(email);
  return !!u && u.password === pwd;
};

(userModel as any).findByEmail = findByEmail;
(userModel as any).getUserByEmail = findByEmail;
(userModel as any).getByEmail = findByEmail;

(userModel as any).createUser = createUser;
(userModel as any).insertUser = createUser;
(userModel as any).create = createUser;

(userModel as any).checkPassword = checkPassword;
(userModel as any).verifyPassword = checkPassword;
(userModel as any).validateUser = checkPassword;

(userModel as any).hashPassword = async (x: string) => x;
(userModel as any).comparePassword = async (plain: string, hashed: string) =>
  plain === hashed;

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
const agent = request.agent(app);

const arbMaybeEmail = fc.oneof(
  fc.record({
    local: fc.string({ minLength: 1, maxLength: 32 }),
    domain: fc.string({ minLength: 1, maxLength: 16 }),
    tld: fc.constantFrom('com', 'net', 'org', 'io', 'sg'),
  }).map(({ local, domain, tld }) => `${local.replace(/\s/g, '')}@${domain}.${tld}`),
  fc.string({ maxLength: 64 })
);

// Password generator
const arbPassword = fc.oneof(
  fc.string({ maxLength: 4 }), // too short
  fc.string({ minLength: 8, maxLength: 40 }) // long enough (may still be invalid by your rules)
);

// Name generator (allows whitespace/empty sometimes).
const arbName = fc.oneof(
  fc.string({ maxLength: 40 }),
  fc.constantFrom('', '   ', '\tAlice', 'Bob   ', '  Carol  ')
);

function maybeDrop<T extends object>(obj: T) {
  const copy: Record<string, any> = { ...obj };
  if (Math.random() < 0.25) delete copy.name;
  if (Math.random() < 0.25) delete copy.email;
  if (Math.random() < 0.25) delete copy.password;
  return copy;
}

const RUN_FOR_MS = 24 * 60 * 60 * 1000; // 24 hours
const endTime = Date.now() + RUN_FOR_MS;

let iteration = 0;

async function fuzzOnce() {
  iteration++;

  // 0: register, 1: login
  const which = Math.random() < 0.5 ? 0 : 1;

  let route = '';
  let payload: any = {};
  let httpStatus = 0;
  let status = 'PASS';
  let errorMsg = '';

  try {
    if (which === 0) {
      route = '/api/auth/register';

      const sample = fc.sample(
        fc.record({
          name: arbName,
          email: arbMaybeEmail,
          password: arbPassword,
        }),
        1
      )[0];
      if (users.length > 0 && Math.random() < 0.25) {
        const pick = users[Math.floor(Math.random() * users.length)];
        sample.email = pick.email;
      }

      payload = maybeDrop(sample);

      const res = await agent.post(route).send(payload).set('Content-Type', 'application/json');
      httpStatus = res.status;
    } else {
      route = '/api/auth/login';

      const sample = fc.sample(
        fc.record({
          email: arbMaybeEmail,
          password: arbPassword,
        }),
        1
      )[0];

      if (users.length > 0 && Math.random() < 0.4) {
        const pick = users[Math.floor(Math.random() * users.length)];
        sample.email = pick.email;
        // randomly choose correct/incorrect password
        sample.password = Math.random() < 0.7 ? pick.password : `${pick.password}X`;
      }

      payload = maybeDrop(sample);

      const res = await agent.post(route).send(payload).set('Content-Type', 'application/json');
      httpStatus = res.status;
    }
  } catch (err: any) {
    status = 'FAIL';
    errorMsg = (err?.message || '').replace(/\n/g, ' ');
    console.error('Crash on iteration', iteration, err);
  }

  const row = [
    iteration,
    new Date().toISOString(),
    route,
    JSON.stringify(payload).replace(/\n/g, ' '),
    status,
    httpStatus,
    `"${errorMsg.replace(/"/g, '""')}"`,
  ].join(',') + '\n';

  fs.appendFileSync(reportPath, row);

  if (iteration % 1000 === 0) {
    console.log(`[${new Date().toISOString()}] Iterations: ${iteration}`);
  }

  await new Promise((r) => setTimeout(r, 1));
}

(async function runFuzz() {
  console.log('Starting 24-hour Auth Router fuzzing session...');
  console.log('Report:', reportPath);
  while (Date.now() < endTime) {
    await fuzzOnce();
  }
  console.log('Auth fuzzing finished. Total iterations:', iteration);
})();
