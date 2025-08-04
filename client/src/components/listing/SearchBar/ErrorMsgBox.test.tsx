import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ErrorMsgBox from './ErrorMsgBox';

describe('ErrorMsgBox', () => {
  it('Tests renders the error message', () => {
    const errorMsg = 'test error message';
    render(<ErrorMsgBox errorMsg={errorMsg} />);

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
    expect(screen.getByTestId('error-msg-box')).toBeInTheDocument();
  });
});
