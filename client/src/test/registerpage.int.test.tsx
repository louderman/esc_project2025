import React from 'react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import { mockFetch, resetUsers } from './auth.mock';

// Router mock
const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual: any = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});

// Render helper
const setup = () =>
  render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );

// DOM helpers
const getNameInput = (ui: ReturnType<typeof setup>) =>
  ui.getAllByPlaceholderText('Enter your profile name')[0] as HTMLInputElement;
const getEmailInput = (ui: ReturnType<typeof setup>) =>
  ui.getAllByPlaceholderText('Enter your email address')[0] as HTMLInputElement;
const getPasswordInput = (ui: ReturnType<typeof setup>) =>
  ui.getAllByPlaceholderText('Enter your password')[0] as HTMLInputElement;
const getCreateBtn = (ui: ReturnType<typeof setup>) =>
  ui.getByRole('button', { name: /create an account/i });

let fetchSpy: any;

beforeEach(() => {
  resetUsers();
  fetchSpy = vi.fn(mockFetch as any);
  vi.stubGlobal('fetch', fetchSpy);
  navigateMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('TC_SIGNUP_1 – Username field', () => {
  it('typing shows the username', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
    await user.type(name, 'sh');
    expect(name.value).toBe('sh');
  });

  it('empty string → shows error', async () => {
    const ui = setup();
    const user = userEvent.setup();
    const name = getNameInput(ui);
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

describe('ITC_SIGNUP_1 – Create account button', () => {
  const fill = async (
    ui: ReturnType<typeof setup>,
    name?: string,
    email?: string,
    pwd?: string
  ) => {
    const user = userEvent.setup();
    if (name) await user.type(getNameInput(ui), name);
    if (email) await user.type(getEmailInput(ui), email);
    if (pwd) await user.type(getPasswordInput(ui), pwd);
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
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('invalid name, valid email & password → name error only', async () => {
    const ui = setup();
    const user = await fill(ui, '  Alice', 'alice@gmail.com', 'Strong@123');
    await user.click(getCreateBtn(ui));

    expect(await ui.findByText(/Name cannot be empty/i)).toBeVisible();
    expect(ui.queryByText(/Email must be valid/i)).toBeNull();
    expect(ui.queryByText(/Password must be ≥8 chars/i)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('invalid email, valid name & password → email error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'Alice', 'alicegmail.com', 'Strong@123');
    await user.click(getCreateBtn(ui));

    // we assert by CSS invalid class to avoid native HTML popup differences
    expect(getEmailInput(ui).className).toMatch(/invalid/);
    expect(getNameInput(ui).className).not.toMatch(/invalid/);
    expect(getPasswordInput(ui).className).not.toMatch(/invalid/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('invalid password, valid name & email → password error only', async () => {
    const ui = setup();
    const user = await fill(ui, 'Alice', 'alice@gmail.com', 'weak');
    await user.click(getCreateBtn(ui));

    expect(await ui.findByText(/Password must be ≥8 chars/i)).toBeVisible();
    expect(ui.queryByText(/Name cannot be empty/i)).toBeNull();
    expect(ui.queryByText(/Email must be valid/i)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('all inputs valid → alert + request sent', async () => {
    const ui = setup();
    const user = await fill(ui, 'Alice', 'alice@gmail.com', 'Strong@123!');
    await user.click(getCreateBtn(ui));

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
