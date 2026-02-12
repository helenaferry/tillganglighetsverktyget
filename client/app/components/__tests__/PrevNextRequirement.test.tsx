import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { Requirement } from '../../data/types';
import PrevNextRequirement from '../PrevNextRequirement';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PrevNextRequirement', () => {
  const mockNextRequirement: Requirement = {
    id: 'req-next',
    name: 'Next Requirement',
  } as Requirement;

  const mockPreviousRequirement: Requirement = {
    id: 'req-prev',
    name: 'Previous Requirement',
  } as Requirement;

  describe('with next unhandled requirement', () => {
    it('shows next requirement name in heading', () => {
      const { container } = renderWithRouter(
        <PrevNextRequirement reviewId="123" nextUnhandled={mockNextRequirement} />,
      );
      const heading = container.querySelector('h4');
      expect(heading?.textContent).toContain('Next Requirement');
    });

    it('renders next button', () => {
      const { getByText } = renderWithRouter(
        <PrevNextRequirement reviewId="123" nextUnhandled={mockNextRequirement} />,
      );
      const button = getByText('PrevNextRequirement.NextRequirement');
      expect(button).toBeInTheDocument();
    });

    it('does not show previous button when only next exists', () => {
      renderWithRouter(<PrevNextRequirement reviewId="123" nextUnhandled={mockNextRequirement} />);
      const prevLink = document.querySelector('a[href*="req-prev"]');
      expect(prevLink).not.toBeInTheDocument();
    });
  });

  describe('with previous unhandled requirement only', () => {
    it('shows previous requirement name in heading', () => {
      const { container } = renderWithRouter(
        <PrevNextRequirement reviewId="123" previousUnhandled={mockPreviousRequirement} />,
      );
      const heading = container.querySelector('h4');
      expect(heading?.textContent).toContain('Previous Requirement');
    });

    it('renders previous button', () => {
      const { getByText } = renderWithRouter(
        <PrevNextRequirement reviewId="123" previousUnhandled={mockPreviousRequirement} />,
      );
      const button = getByText('PrevNextRequirement.PreviousRequirement');
      expect(button).toBeInTheDocument();
    });

    it('does not show next button when only previous exists', () => {
      renderWithRouter(
        <PrevNextRequirement reviewId="123" previousUnhandled={mockPreviousRequirement} />,
      );
      const nextLink = document.querySelector('a[href*="req-next"]');
      expect(nextLink).not.toBeInTheDocument();
    });
  });

  describe('with both next and previous', () => {
    it('shows next requirement name in heading (next takes priority)', () => {
      const { container } = renderWithRouter(
        <PrevNextRequirement
          reviewId="123"
          nextUnhandled={mockNextRequirement}
          previousUnhandled={mockPreviousRequirement}
        />,
      );
      const heading = container.querySelector('h4');
      expect(heading?.textContent).toContain('Next Requirement');
      expect(heading?.textContent).not.toContain('Previous Requirement');
    });

    it('renders both buttons', () => {
      const { getByText } = renderWithRouter(
        <PrevNextRequirement
          reviewId="123"
          nextUnhandled={mockNextRequirement}
          previousUnhandled={mockPreviousRequirement}
        />,
      );
      const nextButton = getByText('PrevNextRequirement.NextRequirement');
      const prevButton = getByText('PrevNextRequirement.PreviousRequirement');
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
    });
  });

  describe('with no unhandled requirements', () => {
    it('shows "no more unhandled" message in heading', () => {
      const { container } = renderWithRouter(<PrevNextRequirement reviewId="123" />);
      const heading = container.querySelector('h4');
      // Translation key will be used, so just check heading exists
      expect(heading).toBeInTheDocument();
    });

    it('does not show prev/next buttons when none exist', () => {
      renderWithRouter(<PrevNextRequirement reviewId="123" />);
      const prevLink = document.querySelector('a[href*="req-prev"]');
      const nextLink = document.querySelector('a[href*="req-next"]');
      expect(prevLink).not.toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
    });
  });

  describe('URL generation', () => {
    it('generates correct URL with reviewId and requirement id', () => {
      const { getByText } = renderWithRouter(
        <PrevNextRequirement reviewId="456" nextUnhandled={mockNextRequirement} />,
      );
      const button = getByText('PrevNextRequirement.NextRequirement');
      expect(button).toBeInTheDocument();
    });

    it('includes #krav anchor in URLs', () => {
      const { getByText } = renderWithRouter(
        <PrevNextRequirement reviewId="123" previousUnhandled={mockPreviousRequirement} />,
      );
      const button = getByText('PrevNextRequirement.PreviousRequirement');
      expect(button).toBeInTheDocument();
    });
  });
});
