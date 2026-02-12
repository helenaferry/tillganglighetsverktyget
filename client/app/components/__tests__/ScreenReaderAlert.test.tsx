import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ScreenReaderAlert from '../ScreenReaderAlert';

describe('ScreenReaderAlert', () => {
  it('renders children content', () => {
    render(
      <ScreenReaderAlert updateOnChange={0}>
        <span>Test content</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('has role="alert" for screen readers', () => {
    render(
      <ScreenReaderAlert updateOnChange={0}>
        <span>Alert message</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ScreenReaderAlert updateOnChange={0} className="custom-class">
        <span>Content</span>
      </ScreenReaderAlert>,
    );

    const alertDiv = container.querySelector('.custom-class');
    expect(alertDiv).toBeInTheDocument();
    expect(alertDiv).toHaveAttribute('role', 'alert');
  });

  it('updates when updateOnChange prop changes (string)', () => {
    const { rerender } = render(
      <ScreenReaderAlert updateOnChange="initial">
        <span>Initial message</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByText('Initial message')).toBeInTheDocument();

    rerender(
      <ScreenReaderAlert updateOnChange="updated">
        <span>Updated message</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByText('Updated message')).toBeInTheDocument();
  });

  it('updates when updateOnChange prop changes (number)', () => {
    const { rerender } = render(
      <ScreenReaderAlert updateOnChange={1}>
        <span>First update</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByText('First update')).toBeInTheDocument();

    rerender(
      <ScreenReaderAlert updateOnChange={2}>
        <span>Second update</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByText('Second update')).toBeInTheDocument();
  });

  it('renders multiple children elements', () => {
    render(
      <ScreenReaderAlert updateOnChange={0}>
        <span>First element</span>
        <span>Second element</span>
      </ScreenReaderAlert>,
    );

    expect(screen.getByText('First element')).toBeInTheDocument();
    expect(screen.getByText('Second element')).toBeInTheDocument();
  });

  it('re-renders component with new key when updateOnChange changes', () => {
    const { rerender } = render(
      <ScreenReaderAlert updateOnChange={0}>
        <span>Content</span>
      </ScreenReaderAlert>,
    );

    rerender(
      <ScreenReaderAlert updateOnChange={1}>
        <span>Content</span>
      </ScreenReaderAlert>,
    );

    // The key change should cause a new element to be created
    // This is important for screen readers to announce the update
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
