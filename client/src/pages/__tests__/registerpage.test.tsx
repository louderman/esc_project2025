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
// const getPasswordInput = (ui: ReturnType<typeof setup>) =>
//   ui.getAllByPlaceholderText('Enter your password')[0] as HTMLInputElement;
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

// TC_SIGNUP_1 – Username field
describe('TC_SIGNUP_1 - Username field', () => {
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
      await ui.findByText(
        /Name cannot be empty or have leading\/trailing spaces/i
      )
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
      await ui.findByText(
        /Name cannot be empty or have leading\/trailing spaces/i
      )
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
      await ui.findByText(
        /Name cannot be empty or have leading\/trailing spaces/i
      )
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
