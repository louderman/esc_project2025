// client/src/test/auth.mock.ts
let users: { id: number; name: string; email: string; password: string }[] = [];
let idSeq = 1;

export function resetUsers() {
  users = [];
  idSeq = 1;
}

export async function mockFetch(url: string, options?: RequestInit) {
  const { method = 'GET' } = options || {};

  if (url.endsWith('/api/auth/register') && method === 'POST') {
    const body = JSON.parse(options?.body as string);
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return mkRes(400, { message: 'All fields are required.' });
    }
    if (users.some((u) => u.email === email)) {
      return mkRes(400, { message: 'Email already exists.' });
    }
    const newUser = { id: idSeq++, name, email, password };
    users.push(newUser);
    return mkRes(201, { message: 'User registered successfully.' });
  }

  if (url.endsWith('/api/auth/login') && method === 'POST') {
    const body = JSON.parse(options?.body as string);
    const { email, password } = body;
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return mkRes(401, { message: 'Invalid email or password.' });
    }
    return mkRes(200, { message: 'Login successful.', userId: user.id, name: user.name });
  }

  return mkRes(404, { message: 'Not Found' });
}

function mkRes(status: number, data: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}
