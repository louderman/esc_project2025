import React from 'react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

import LoginPage from '../pages/LoginPage';

const fetchMock = vi.fn();
const alertMock = vi.fn();
Object.defineProperty(global, 'fetch', { value: fetchMock, writable: true });
Object.defineProperty(window, 'alert', { value: alertMock, writable: true });

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );

const getEmailInput = (ui: ReturnType<typeof setup>) => {
  const labels = ui.getAllByText(/^Email$/i);
  const label = labels[0] as HTMLElement;
  let el = label.nextElementSibling as HTMLInputElement | null;

  if (!el || el.tagName !== 'INPUT') {
    const form = label.closest('form');
    if (!form) throw new Error('Form not found for Email label');
    el = form.querySelector('input[type="text"]') as HTMLInputElement | null;
  }
  if (!el) throw new Error('Email input not found');
  return el;
};

const getPasswordInput = (ui: ReturnType<typeof setup>) => {
  const labels = ui.getAllByText(/^Password$/i);
  const label = labels[0] as HTMLElement;

  let wrapper = label.nextElementSibling as HTMLElement | null;
  if (!wrapper) {
    const form = label.closest('form');
    if (!form) throw new Error('Form not found for Password label');
    wrapper = form.querySelector('.passwordWrapper') as HTMLElement | null;
  }

  let input = wrapper?.querySelector('input') as HTMLInputElement | null;
  if (!input) {
    const form = label.closest('form');
    input = form?.querySelector('input[type="password"]') as HTMLInputElement | null;
  }
  if (!input) throw new Error('Password input not found');
  return input;
};

const getLoginButton = (ui: ReturnType<typeof setup>) =>
  ui.getByRole('button', { name: /log in/i });

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

describe('ITC_LOGIN_1 – Log in button', () => {
  const fill = async (ui: ReturnType<typeof setup>, email?: string, password?: string) => {
    const user = userEvent.setup();
    if (typeof email === 'string' && email.length > 0) {
      await user.type(getEmailInput(ui), email);
    }
    if (typeof password === 'string' && password.length > 0) {
      await user.type(getPasswordInput(ui), password);
    }
    return user;
  };

  it('empty fields → show errors, no redirect', async () => {
    const ui = setup();
    const user = await fill(ui, '', '');
    await user.click(getLoginButton(ui));

    expect(ui.getByText(/Email must be valid and contain no spaces\./i)).toBeVisible();
    expect(ui.getByText(/Password must be at least 8 characters with no spaces\./i)).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('invalid email, valid password → email error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'alicegmail.com', 'StrongPass1');
    await user.click(getLoginButton(ui));

    expect(ui.getByText(/Email must be valid and contain no spaces\./i)).toBeVisible();
    expect(ui.queryByText(/Password must be at least 8 characters/i)).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('invalid password, valid email → password error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'alice@gmail.com', 'short');
    await user.click(getLoginButton(ui));

    expect(ui.getByText(/Password must be at least 8 characters with no spaces\./i)).toBeVisible();
    expect(ui.queryByText(/Email must be valid and contain no spaces\./i)).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('all inputs valid', async () => {
    const ui = setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 123, name: 'Alice' }),
    } as any);

    const user = await fill(ui, 'alice@gmail.com', 'StrongPass1');
    await user.click(getLoginButton(ui));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ method: 'POST' })
      )
    );

    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalled();
      const payload = setUserMock.mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          id: 123,
          name: 'Alice',
          email: 'alice@gmail.com',
        })
      );
    });

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/from-here'));
  });
});