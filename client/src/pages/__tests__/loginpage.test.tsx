import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../pages/LoginPage';
import { MemoryRouter } from 'react-router-dom';

// ---- Router + Auth mocks ----
const navigateMock = vi.fn();
const setUserMock = vi.fn();

vi.mock('react-router-dom', async (orig) => {
  const actual: any = await orig();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: '/login', state: { from: '/from-here' } }),
  };
});

vi.mock('../../components/common/authcontext', () => ({
  useAuth: () => ({ user: null, setUser: setUserMock }),
}));

// ---- Network + alert mocks ----
const fetchMock = vi.fn();
const alertMock = vi.fn();
Object.defineProperty(global, 'fetch', { value: fetchMock, writable: true });
Object.defineProperty(window, 'alert', { value: alertMock, writable: true });

// ---- Render helper ----
const setup = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );

// ---- DOM helpers (label → sibling / safe fallbacks) ----
const getEmailInput = (ui: ReturnType<typeof setup>) => {
  const label = ui.getByText(/^Email$/i);
  // structure: <label>Email</label><input ... />
  let el = label.nextElementSibling as HTMLInputElement | null;
  if (!el || el.tagName !== 'INPUT') {
    const form = label.closest('form');
    el = form?.querySelector('input[type="text"]') as HTMLInputElement | null;
  }
  if (!el) throw new Error('Email input not found');
  return el;
};

const getPasswordInput = (ui: ReturnType<typeof setup>) => {
  const label = ui.getByText(/^Password$/i);
  // structure: <label>Password</label><div class="passwordWrapper"><input .../></div>
  let wrapper = label.nextElementSibling as HTMLElement | null;
  if (!wrapper) {
    const form = label.closest('form');
    wrapper = form?.querySelector('.passwordWrapper') as HTMLElement | null;
  }
  let input = wrapper?.querySelector('input') as HTMLInputElement | null;
  if (!input) {
    const form = label.closest('form');
    input = form?.querySelector('input[type="password"]') as HTMLInputElement | null;
  }
  if (!input) throw new Error('Password input not found');
  return input;
};

const getLoginBtn = (ui: ReturnType<typeof setup>) =>
  ui.getByRole('button', { name: /log in/i });

// ---- Lifecycle ----
beforeEach(() => {
  fetchMock.mockReset();
  alertMock.mockReset();
  navigateMock.mockReset();
  setUserMock.mockReset();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

// -------------------- UNIT: test a single field at a time --------------------
describe('UC_LOGIN_1 – Email field (unit)', () => {
  it('typing shows email', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const email = getEmailInput(ui);
    await user.type(email, 'test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('empty email → shows error (only email validated here)', async () => {
    const ui = setup();
    const user = userEvent.setup();
    await user.clear(getEmailInput(ui));
    await user.click(getLoginBtn(ui));
    expect(await ui.findByText(/Email must be valid and contain no spaces\./i)).toBeVisible();
  });
});

describe('UC_LOGIN_2 – Password field (unit)', () => {
  it('typing shows password', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const pwd = getPasswordInput(ui);
    await user.type(pwd, 'MySecret123');
    expect(pwd.value).toBe('MySecret123');
  });

  it('empty password → shows error (only password validated here)', async () => {
    const ui = setup();
    const user = userEvent.setup();
    await user.clear(getPasswordInput(ui));
    await user.click(getLoginBtn(ui));
    expect(await ui.findByText(/Password must be at least 8 characters with no spaces\./i)).toBeVisible();
  });
});
