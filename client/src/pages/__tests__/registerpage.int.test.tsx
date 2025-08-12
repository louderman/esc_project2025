import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../../pages/RegisterPage';
import { MemoryRouter } from 'react-router-dom';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual: any = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});

const fetchMock = vi.fn();
const alertMock = vi.fn();
Object.defineProperty(global, 'fetch', { value: fetchMock, writable: true });
Object.defineProperty(window, 'alert', { value: alertMock, writable: true });

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );

const getNameInput = (ui: ReturnType<typeof setup>) =>
  ui.getAllByPlaceholderText('Enter your profile name')[0] as HTMLInputElement;
const getEmailInput = (ui: ReturnType<typeof setup>) =>
  ui.getAllByPlaceholderText('Enter your email address')[0] as HTMLInputElement;
const getPasswordInput = (ui: ReturnType<typeof setup>) =>
  ui.getAllByPlaceholderText('Enter your password')[0] as HTMLInputElement;
const getCreateBtn = (ui: ReturnType<typeof setup>) =>
  ui.getByRole('button', { name: /create an account/i });

beforeEach(() => {
  fetchMock.mockReset();
  alertMock.mockReset();
  navigateMock.mockReset();
});

afterEach(() => {
  cleanup();
});

// ITC_SIGNUP_1 – Create account button
describe('ITC_SIGNUP_1 – Create account button (integration)', () => {
  const fill = async (
    ui: ReturnType<typeof setup>,
    name?: string,
    email?: string,
    pwd?: string
  ) => {
    const user = userEvent.setup();
    if (typeof name === 'string' && name.length > 0) {
      await user.type(getNameInput(ui), name);
    }
    if (typeof email === 'string' && email.length > 0) {
      await user.type(getEmailInput(ui), email);
    }
    if (typeof pwd === 'string' && pwd.length > 0) {
      await user.type(getPasswordInput(ui), pwd);
    }
    return user;
  };

  it('empty fields → show errors, no redirect', async () => {
    const ui = setup();
    const user = await fill(ui, '', '', '');
    await user.click(getCreateBtn(ui));

    expect(await ui.findByText(/Name cannot be empty/i)).toBeVisible();
    expect(await ui.findByText(/Email must be valid/i)).toBeVisible();
    expect(await ui.findByText(/Password must be ≥8 chars/i)).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('invalid name, valid email & password → name error only', async () => {
    const ui = setup();
    const user = await fill(ui, '  Alice', 'alice@gmail.com', 'Strong@123');
    await user.click(getCreateBtn(ui));

    expect(await ui.findByText(/Name cannot be empty/i)).toBeVisible();
    expect(ui.queryByText(/Email must be valid/i)).toBeNull();
    expect(ui.queryByText(/Password must be ≥8 chars/i)).toBeNull();
  });

  it('invalid email, valid name & password → blocked by native HTML5 validation', async () => {
    const ui = setup();
    const user = await fill(ui, 'Alice', 'alicegmail.com', 'Strong@123');
    await user.click(getCreateBtn(ui));
    expect(getEmailInput(ui).checkValidity()).toBe(false);
    expect(ui.queryByText(/Name cannot be empty/i)).toBeNull();
    expect(ui.queryByText(/Password must be ≥8 chars/i)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('invalid password, valid name & email → password error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'Alice', 'alice@gmail.com', 'weak');
    await user.click(getCreateBtn(ui));

    expect(await ui.findByText(/Password must be ≥8 chars/i)).toBeVisible();
    expect(ui.queryByText(/Name cannot be empty/i)).toBeNull();
    expect(ui.queryByText(/Email must be valid/i)).toBeNull();
  });

  it('all inputs valid → alert + request sent', async () => {
    const ui = setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as any);
    const user = await fill(ui, 'Alice', 'alice@gmail.com', 'Strong@123!');
    await user.click(getCreateBtn(ui));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
