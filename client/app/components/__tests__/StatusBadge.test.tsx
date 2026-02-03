import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Status } from '../../data/types';

import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders PASS status badge component', () => {
    const { container } = render(<StatusBadge status={Status.PASS} />);
    const badge = container.querySelector('digi-badge-status');

    expect(badge).toBeInTheDocument();
  });

  it('renders FAIL status badge component', () => {
    const { container } = render(<StatusBadge status={Status.FAIL} />);
    const badge = container.querySelector('digi-badge-status');

    expect(badge).toBeInTheDocument();
  });

  it('renders IRRELEVANT status badge component', () => {
    const { container } = render(<StatusBadge status={Status.IRRELEVANT} />);
    const badge = container.querySelector('digi-badge-status');

    expect(badge).toBeInTheDocument();
  });

  it('renders NOT_ASSESSED status badge component', () => {
    const { container } = render(<StatusBadge status={Status.NOT_ASSESSED} />);
    const badge = container.querySelector('digi-badge-status');

    expect(badge).toBeInTheDocument();
  });

  it('applies min-width class by default', () => {
    const { container } = render(<StatusBadge status={Status.PASS} />);
    const wrapper = container.querySelector('div');

    expect(wrapper).toHaveClass('min-w-[6rem]');
  });

  it('does not apply min-width class when noMinWidth is true', () => {
    const { container } = render(<StatusBadge status={Status.PASS} noMinWidth />);
    const wrapper = container.querySelector('div');

    expect(wrapper).not.toHaveClass('min-w-[6rem]');
  });

  it('handles null status as NOT_ASSESSED', () => {
    const { container } = render(<StatusBadge status={null} />);
    const badge = container.querySelector('digi-badge-status');

    expect(badge).toBeInTheDocument();
  });

  it('handles undefined status as NOT_ASSESSED', () => {
    const { container } = render(<StatusBadge status={undefined} />);
    const badge = container.querySelector('digi-badge-status');

    expect(badge).toBeInTheDocument();
  });
});
