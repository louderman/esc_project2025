// client/src/test/loginpage.test.tsx
import React from 'react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { mockFetch, resetUsers } from './auth.mock';

// Router + Auth mocks
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

vi.mock('../components/common/authcontext', () => ({
  useAuth: () => ({ user: null, setUser: setUserMock }),
}));

// Render helper
const setup = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );

// DOM helpers (fits the markup in LoginPage.tsx)
const getEmailInput = (ui: ReturnType<typeof setup>) => {
  // Label then sibling input
  const label = ui.getAllByText(/^Email$/i)[0] as HTMLElement;
  const el = label.nextElementSibling as HTMLInputElement | null;
  if (!el || el.tagName !== 'INPUT') throw new Error('Email input not found');
  return el;
};

const getPasswordInput = (ui: ReturnType<typeof setup>) => {
  const label = ui.getAllByText(/^Password$/i)[0] as HTMLElement;
  const wrapper = label.nextElementSibling as HTMLElement | null;
  const input = wrapper?.querySelector('input') as HTMLInputElement | null;
  if (!input) throw new Error('Password input not found');
  return input;
};

const getLoginButton = (ui: ReturnType<typeof setup>) =>
  ui.getByRole('button', { name: /log in/i });

let fetchSpy: any;

beforeEach(() => {
  resetUsers();
  fetchSpy = vi.fn(mockFetch as any);
  vi.stubGlobal('fetch', fetchSpy);

  navigateMock.mockReset();
  setUserMock.mockReset();
  localStorage.clear();
});

describe('ITC_LOGIN_1 – Log in button', () => {
  const fill = async (ui: ReturnType<typeof setup>, email?: string, password?: string) => {
    const user = userEvent.setup();
    if (email) await user.type(getEmailInput(ui), email);
    if (password) await user.type(getPasswordInput(ui), password);
    return user;
  };

  it('empty fields → show errors, no redirect', async () => {
    const ui = setup();
    const user = await fill(ui, '', '');
    await user.click(getLoginButton(ui));

    expect(ui.getByText(/Email must be valid and contain no spaces\./i)).toBeVisible();
    expect(ui.getByText(/Password must be at least 8 characters with no spaces\./i)).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('invalid email, valid password → email error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'alicegmail.com', 'StrongPass1');
    await user.click(getLoginButton(ui));

    expect(ui.getByText(/Email must be valid and contain no spaces\./i)).toBeVisible();
    expect(ui.queryByText(/Password must be at least 8 characters/i)).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('invalid password, valid email → password error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'alice@gmail.com', 'short');
    await user.click(getLoginButton(ui));

    expect(ui.getByText(/Password must be at least 8 characters with no spaces\./i)).toBeVisible();
    expect(ui.queryByText(/Email must be valid and contain no spaces\./i)).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('all inputs valid → alert + navigate back', async () => {
    // Pre-create a user via our mock register so login can succeed
    const reg = await mockFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@gmail.com', password: 'StrongPass1' }),
    });
    expect(reg.ok).toBe(true);

    const ui = setup();
    const user = await fill(ui, 'alice@gmail.com', 'StrongPass1');
    await user.click(getLoginButton(ui));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ method: 'POST' })
      )
    );

    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalled();
      const payload = setUserMock.mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({ id: expect.any(Number), name: 'Alice', email: 'alice@gmail.com' })
      );
    });

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/from-here'));
  });
});
