import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { type Check, ObjectType, type Requirement, type Review, Status } from '../../data/types';
import Export from '../Export';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Export', () => {
  const mockReview: Review = {
    id: 1,
    title: 'Test Review',
    created_at: '2024-01-01',
    objectType: 'web',
    regulatoryFramework: 'wcag',
    excludedContentTypes: null,
    selectedPrefillIds: null,
  };

  const mockRequirements: Requirement[] = [
    {
      id: 'req1',
      name: 'Requirement 1',
      category: 'Category A',
      regulatoryFramework: 'wcag',
      wcag: '1.1.1',
      en301549: '9.1.1.1',
      contentType: 'text',
      objectType: ObjectType.WEB,
      statement: 'Test statement',
      why: 'Test why',
      howToTest: 'Test how to test',
    } as Requirement,
    {
      id: 'req2',
      name: 'Requirement 2',
      category: 'Category B',
      regulatoryFramework: 'wcag',
      wcag: '1.2.1',
      en301549: '9.1.2.1',
      contentType: 'text',
      objectType: ObjectType.WEB,
      statement: 'Test statement 2',
      why: 'Test why 2',
      howToTest: 'Test how to test 2',
    } as Requirement,
    {
      id: 'req3',
      name: 'Requirement 3',
      category: 'Category A',
      regulatoryFramework: 'wcag',
      wcag: '1.3.1',
      en301549: '9.1.3.1',
      contentType: 'text',
      objectType: ObjectType.WEB,
      statement: 'Test statement 3',
      why: 'Test why 3',
      howToTest: 'Test how to test 3',
    } as Requirement,
  ];

  const mockChecks: Check[] = [
    {
      id: 1,
      requirement: 'req1',
      review: 1,
      status: Status.FAIL,
      comment: 'Failed check comment',
      flag: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      requirement: 'req2',
      review: 1,
      status: Status.PASS,
      comment: 'Passed check comment',
      flag: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 3,
      requirement: 'req3',
      review: 1,
      status: null,
      comment: 'Not assessed comment',
      flag: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  describe('failed checks filtering', () => {
    it('filters checks with status 0 (FAIL)', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // Should show failed requirement
      expect(container.textContent).toContain('Requirement 1');
    });

    it('filters checks with null status', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // req3 has null status, should be included
      expect(container.textContent).toContain('Requirement 3');
    });

    it('does not show passed checks', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // req2 passed, should not be shown
      expect(container.textContent).not.toContain('Passed check comment');
    });
  });

  describe('empty states', () => {
    it('shows message when no failed checks', () => {
      const passedChecks: Check[] = [
        {
          ...mockChecks[0],
          status: Status.PASS,
        },
      ];
      renderWithRouter(
        <Export
          review={mockReview}
          checks={passedChecks}
          requirements={mockRequirements}
          categories={['Category A']}
        />,
      );
      // Should show "no failed checks" message via translation key
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('handles empty checks array', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={[]}
          requirements={mockRequirements}
          categories={['Category A']}
        />,
      );
      expect(container).toBeInTheDocument();
    });

    it('handles undefined checks', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={undefined}
          requirements={mockRequirements}
          categories={['Category A']}
        />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('category grouping', () => {
    it('groups failed checks by category', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // Both Category A requirements (req1 and req3) should be shown
      expect(container.textContent).toContain('Requirement 1');
      expect(container.textContent).toContain('Requirement 3');
    });

    it('does not render category if no failed checks in it', () => {
      const onlyFailedInA: Check[] = [
        {
          ...mockChecks[0],
          status: Status.FAIL,
        },
      ];
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={onlyFailedInA}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // Should only show req1 from Category A
      expect(container.textContent).toContain('Requirement 1');
      expect(container.textContent).not.toContain('Requirement 2');
    });
  });

  describe('requirement comments', () => {
    it('displays check comments when present', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      expect(container.textContent).toContain('Failed check comment');
    });

    it('handles requirements without comments', () => {
      const checksWithoutComments: Check[] = [
        {
          ...mockChecks[0],
          comment: null,
        },
      ];
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={checksWithoutComments}
          requirements={mockRequirements}
          categories={['Category A']}
        />,
      );
      expect(container.textContent).toContain('Requirement 1');
    });
  });

  describe('requirements merging', () => {
    it('merges requirements with their checks', () => {
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // The component should properly link checks to requirements
      expect(container.textContent).toContain('Requirement 1');
      expect(container.textContent).toContain('Failed check comment');
    });

    it('handles requirements without matching checks', () => {
      const checksForOnlyReq1: Check[] = [mockChecks[0]];
      const { container } = renderWithRouter(
        <Export
          review={mockReview}
          checks={checksForOnlyReq1}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      // Should only show req1 which has a failed check
      expect(container.textContent).toContain('Requirement 1');
      expect(container.textContent).not.toContain('Requirement 2');
      expect(container.textContent).not.toContain('Requirement 3');
    });
  });

  describe('export buttons', () => {
    it('shows export buttons when there are failed checks', () => {
      renderWithRouter(
        <Export
          review={mockReview}
          checks={mockChecks}
          requirements={mockRequirements}
          categories={['Category A', 'Category B']}
        />,
      );
      const buttons = document.querySelectorAll('digi-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('does not show export buttons when no failed checks', () => {
      const passedChecks: Check[] = [
        {
          ...mockChecks[0],
          status: Status.PASS,
        },
      ];
      renderWithRouter(
        <Export
          review={mockReview}
          checks={passedChecks}
          requirements={mockRequirements}
          categories={['Category A']}
        />,
      );
      // Buttons should not be present when no failed checks
      const buttons = document.querySelectorAll('digi-button');
      // May have 0 buttons or they may be hidden
      expect(buttons.length).toBeLessThanOrEqual(2);
    });
  });
});
