import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ResetButton from '../ResetButton';

// Mock i18n
vi.mock('~/lang/i18n', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        ResetButtonDefaultText: 'Återställ',
      };
      return translations[key] || key;
    },
  },
}));

describe('ResetButton', () => {
  it('renders with default button text', () => {
    const onClick = vi.fn();
    const { container } = render(<ResetButton onClick={onClick} focusOnReset={null} />);
    const button = container.querySelector('digi-button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Återställ');
  });

  it('renders with custom button text', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ResetButton onClick={onClick} focusOnReset={null} buttonText="Rensa filter" />,
    );
    const button = container.querySelector('digi-button');

    expect(button).toHaveTextContent('Rensa filter');
  });

  it('renders redo icon', () => {
    const onClick = vi.fn();
    const { container } = render(<ResetButton onClick={onClick} focusOnReset={null} />);
    const icon = container.querySelector('digi-icon-redo');

    expect(icon).toBeInTheDocument();
  });

  it('renders digi-button Web Component', () => {
    const onClick = vi.fn();
    const { container } = render(<ResetButton onClick={onClick} focusOnReset={null} />);
    const digiButton = container.querySelector('digi-button');

    expect(digiButton).toBeInTheDocument();
  });
});
