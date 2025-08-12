import React from 'react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, waitFor } from '@testing-library/react';
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

vi.mock('../../components/common/authcontext', () => ({
  useAuth: () => ({ user: null, setUser: setUserMock }),
}));

// Import AFTER mocks
import LoginPage from '../../pages/LoginPage';

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
  const labels = ui.queryAllByText(/^Email$/i);
  if (labels.length) {
    const first = labels[0] as HTMLElement;
    const sib = first.nextElementSibling as HTMLInputElement | null;
    if (sib && sib.tagName === 'INPUT') return sib;
  }
  const form = ui.container.querySelector('form');
  const byType = form?.querySelector('input[type="text"]') as HTMLInputElement | null;
  if (byType) return byType;
  return ui.getAllByRole('textbox')[0] as HTMLInputElement;
};

const getPasswordInput = (ui: ReturnType<typeof setup>) => {
  const labels = ui.queryAllByText(/^Password$/i);
  if (labels.length) {
    const first = labels[0] as HTMLElement;
    const wrapper = first.nextElementSibling as HTMLElement | null;
    const inp = wrapper?.querySelector('input') as HTMLInputElement | null;
    if (inp) return inp;
  }
  const form = ui.container.querySelector('form');
  const byTypePwd = form?.querySelector('input[type="password"]') as HTMLInputElement | null;
  if (byTypePwd) return byTypePwd;
  const anyPwd = form?.querySelector('input') as HTMLInputElement | null;
  if (anyPwd) return anyPwd;
  return ui.getAllByRole('textbox')[1] as HTMLInputElement;
};

const getLoginButton = (ui: ReturnType<typeof setup>) =>
  ui.getAllByRole('button', { name: /log in/i })[0];

describe('ITC_LOGIN_1 – Log in button (integration)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    alertMock.mockReset();
    navigateMock.mockReset();
    setUserMock.mockReset();
    localStorage.clear();
  });

  const fill = async (ui: ReturnType<typeof setup>, email?: string, password?: string) => {
    const user = userEvent.setup();
    if (typeof email === 'string') {
      await user.clear(getEmailInput(ui));
      if (email.length) await user.type(getEmailInput(ui), email);
    }
    if (typeof password === 'string') {
      await user.clear(getPasswordInput(ui));
      if (password.length) await user.type(getPasswordInput(ui), password);
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

  it('all inputs valid → posts, sets user, navigates back', async () => {
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
      const lastArg = setUserMock.mock.calls[0][0];
      expect(lastArg).toEqual(
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
