import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct progress width', () => {
    const { container } = render(<ProgressBar progress={50} />);
    const progressBar = container.querySelector('.bg-stratos-500');

    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('renders with text when provided', () => {
    render(<ProgressBar progress={75} text="Test progress" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Test progress');
  });

  it('does not render text when not provided', () => {
    render(<ProgressBar progress={50} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('adds rounded-r class when progress is 100%', () => {
    const { container } = render(<ProgressBar progress={100} />);
    const progressBar = container.querySelector('.bg-stratos-500');

    expect(progressBar).toHaveClass('rounded-r');
  });

  it('does not add rounded-r class when progress is less than 100%', () => {
    const { container } = render(<ProgressBar progress={50} />);
    const progressBar = container.querySelector('.bg-stratos-500');

    expect(progressBar).not.toHaveClass('rounded-r');
  });
});
