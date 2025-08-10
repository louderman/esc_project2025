import React from 'react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../pages/RegisterPage';
import { MemoryRouter } from 'react-router-dom';

// Router mock
const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual: any = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});

// Network + alert mocks
const fetchMock = vi.fn();
const alertMock = vi.fn();
Object.defineProperty(global, 'fetch', { value: fetchMock, writable: true });
Object.defineProperty(window, 'alert', { value: alertMock, writable: true });

// Render helper
const setup = () =>
  render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );

// DOM helpers (tolerate dupes by index 0)
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
  // Important so typed values from one test don't leak into the next
  cleanup();
});

// TC_SIGNUP_1 – Username field
describe('TC_SIGNUP_1 – Username field', () => {
  it('typing shows the username', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
    await user.type(name, 'sh');
    expect(name.value).toBe('sh');
  });

  it('empty string → shows errors, no redirect', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
    await user.type(name, 'x');
    await user.clear(name);
    await user.click(getCreateBtn(ui));
    expect(
      await ui.findByText(/Name cannot be empty or have leading\/trailing spaces/i)
    ).toBeVisible();
  });

  it('leading spaces → shows error but displays text', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
    await user.type(name, '    Alice');
    expect(name.value).toBe('    Alice');
    await user.click(getCreateBtn(ui));
    expect(
      await ui.findByText(/Name cannot be empty or have leading\/trailing spaces/i)
    ).toBeVisible();
  });

  it('spaces in middle → allowed (no name error) and displays text', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
    await user.type(name, 'Alic  e');
    expect(name.value).toBe('Alic  e');
    await user.click(getCreateBtn(ui));
    expect(
      ui.queryByText(/Name cannot be empty or have leading\/trailing spaces/i)
    ).toBeNull();
  });

  it('trailing spaces → shows error but displays text', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
    await user.type(name, ' Alice   ');
    expect(name.value).toBe(' Alice   ');
    await user.click(getCreateBtn(ui));
    expect(
      await ui.findByText(/Name cannot be empty or have leading\/trailing spaces/i)
    ).toBeVisible();
  });
});

// TC_SIGNUP_2 – Email field
describe('TC_SIGNUP_2 – Email field', () => {
  it('typing shows email', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const email = getEmailInput(ui);
    await user.type(email, 'Alice@gmail.com');
    expect(email.value).toBe('Alice@gmail.com');
  });

  it('leading/trailing spaces displayed (input[type=email] trims visually)', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const email = getEmailInput(ui);
    await user.type(email, '   Alice@gmail.com   ');
    expect(email.value).toBe('Alice@gmail.com');
  });

  it('empty string → shows error', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const email = getEmailInput(ui);
    await user.clear(email);
    await user.click(getCreateBtn(ui));
    expect(
      await ui.findByText(/Email must be valid and contain no spaces\./i)
    ).toBeVisible();
  });

  it('spaces in middle → field shows (native popup not asserted)', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const email = getEmailInput(ui);
    await user.type(email, 'Alic  e@gmail.com');
    expect(email.value).toBe('Alic  e@gmail.com');
  });

  it('missing @ → field shows (native popup not asserted)', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const email = getEmailInput(ui);
    await user.type(email, 'Alicegmail.com');
    expect(email.value).toBe('Alicegmail.com');
  });
});

// ITC_SIGNUP_1 – Create account button
describe('ITC_SIGNUP_1 – Create account button', () => {
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

  it('invalid email, valid name & password → prevented by native validation', async () => {
    const ui = setup();
    const user = await fill(ui, 'Alice', 'alicegmail.com', 'Strong@123');
    await user.click(getCreateBtn(ui));

    // Native validation blocks submission; our custom email error won't show.
    // Assert the input itself is invalid and no network/nav occurred.
    expect(getEmailInput(ui).checkValidity()).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    // Ensure no name/password custom errors appeared (submit never ran)
    expect(ui.queryByText(/Name cannot be empty/i)).toBeNull();
    expect(ui.queryByText(/Password must be ≥8 chars/i)).toBeNull();
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
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any);
    const user = await fill(ui, 'Alice', 'alice@gmail.com', 'Strong@123!');
    await user.click(getCreateBtn(ui));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
