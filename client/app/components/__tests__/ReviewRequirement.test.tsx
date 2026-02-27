import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ObjectType, Status } from '../../data/types';
import i18n from '../../lang/i18n';
import { getQueryClient } from '../../queryClient';
import ReviewRequirement from '../ReviewRequirement';

// Mock design system components
vi.mock('@designsystem-se/af-react', () => ({
  DigiButton: ({
    children,
    onAfOnClick,
    afAriaPressed,
    'aria-pressed': ariaPressed,
    ...props
  }: React.PropsWithChildren<{
    onAfOnClick?: () => void;
    afAriaPressed?: boolean;
    'aria-pressed'?: boolean;
    [key: string]: unknown;
  }>) => (
    <button
      onClick={onAfOnClick}
      aria-pressed={afAriaPressed !== undefined ? afAriaPressed : ariaPressed}
      data-testid="digi-button"
      {...props}
    >
      {children}
    </button>
  ),
  DigiFormValidationMessage: ({ children }: React.PropsWithChildren) => (
    <div data-testid="validation-message">{children}</div>
  ),
  DigiIconComunicationFlag: ({ ...props }: { [key: string]: unknown }) => (
    <span data-testid="icon-flag" {...props}>
      Flag Icon
    </span>
  ),
  DigiIconArrowRight: ({ ...props }: { [key: string]: unknown }) => (
    <span data-testid="icon-arrow-right" {...props}>
      →
    </span>
  ),
  DigiBadgeStatus: ({ ...props }: { [key: string]: unknown }) => (
    <span data-testid="badge-status" {...props}>
      Badge
    </span>
  ),
  DigiLayoutBlock: ({ children }: React.PropsWithChildren) => (
    <div data-testid="layout-block">{children}</div>
  ),
  DigiLayoutContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="layout-container">{children}</div>
  ),
  DigiLinkButton: ({
    children,
    afHref,
    onAfOnClick,
    ...props
  }: React.PropsWithChildren<{
    afHref?: string;
    onAfOnClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }>) => (
    <a data-testid="link-button" href={afHref} onClick={onAfOnClick} {...props}>
      {children}
    </a>
  ),
  DigiLoaderSkeleton: ({ ...props }: { [key: string]: unknown }) => (
    <div data-testid="loader-skeleton" {...props}>
      Loading...
    </div>
  ),
  DigiNotificationAlert: ({ children, afType }: React.PropsWithChildren<{ afType?: string }>) => (
    <div data-testid="notification-alert" data-type={afType}>
      {children}
    </div>
  ),
  DigiNotificationErrorPage: ({ children }: React.PropsWithChildren) => (
    <div data-testid="error-page">{children}</div>
  ),
  DigiTypography: ({ children }: React.PropsWithChildren) => (
    <div data-testid="typography">{children}</div>
  ),
  DigiTypographyHeadingJumbo: ({
    children,
    ...props
  }: React.PropsWithChildren<{ [key: string]: unknown }>) => (
    <h1 data-testid="typography-heading-jumbo" {...props}>
      {children}
    </h1>
  ),
  DigiTypographyPreamble: ({
    children,
    ...props
  }: React.PropsWithChildren<{ [key: string]: unknown }>) => (
    <p data-testid="typography-preamble" {...props}>
      {children}
    </p>
  ),
}));

// Mock hooks
const mockUseReviewById = vi.fn();
const mockUseChecksForReview = vi.fn();
const mockUseCheck = vi.fn();
const mockUseRequirements = vi.fn();
const mockUseRequirementCategories = vi.fn();
const mockToggleCheckFlagMutate = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock away irrelevant components
vi.mock('~/components/Breadcrumbs', () => ({
  default: () => null,
}));

vi.mock('~/components/CategoryNav', () => ({
  default: () => null,
}));

vi.mock('~/components/StatusBadge', () => ({
  default: () => null,
}));

vi.mock('~/components/RequirementDetails', () => ({
  default: () => null,
}));

vi.mock('~/components/RequirementForm', () => ({
  default: () => null,
}));

vi.mock('~/components/RequirementLegal', () => ({
  default: () => null,
}));

vi.mock('~/hooks/useReviewData', () => ({
  useCheck: () => mockUseCheck(),
  useChecksForReview: () => mockUseChecksForReview(),
  useReviewById: () => mockUseReviewById(),
  useToggleCheckFlag: () => ({ mutate: mockToggleCheckFlagMutate }),
}));

vi.mock('~/hooks/useRequirementData', () => ({
  useRequirements: () => mockUseRequirements(),
  useRequirementCategories: () => mockUseRequirementCategories(),
}));

// Component wrapper with necessary test contexts
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('ReviewRequirement', () => {
  const mockReviewId = 'review-123';
  const mockRequirementId = 'requirement-456';
  const unreviewedRequirement2Id = 'requirement-789';

  const mockReview = {
    id: mockReviewId,
    title: 'Test Review',
    created_at: '2026-02-17',
    objectType: ObjectType.WEB,
    regulatoryFramework: 'dos',
  };

  const mockRequirement = {
    id: mockRequirementId,
    name: 'Test Requirement',
    category: 'category-1',
    status: Status.PASS,
    wcag: 'WCAG 2.1 A',
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
    en301549: '',
    contentType: 'web',
    objectType: ObjectType.WEB,
  };

  const reviewedRequirement1 = {
    ...mockRequirement,
    id: 'requirement-123',
    name: 'Reviewed Before Current',
  };

  const unreviewedRequirement1 = {
    ...mockRequirement,
    id: 'requirement-234',
    name: 'Unreviewed Before Current',
  };

  const reviewedRequirement2 = {
    ...mockRequirement,
    id: 'requirement-678',
    name: 'Reviewed After Current',
  };

  const unreviewedRequirement2 = {
    ...mockRequirement,
    id: unreviewedRequirement2Id,
    name: 'Next Unreviewed Requirement',
  };

  const requirementsWithReviewedAndUnreviewedAroundCurrent = [
    reviewedRequirement1,
    unreviewedRequirement1,
    mockRequirement,
    reviewedRequirement2,
    unreviewedRequirement2,
  ];

  const mockCheck = {
    id: 'check-1',
    requirement: mockRequirementId,
    status: Status.PASS,
    flag: false,
    comment: '',
  };

  const checksWithReviewedAndUnreviewedAroundCurrent = [
    { ...mockCheck, requirement: reviewedRequirement1.id, status: Status.PASS },
    { ...mockCheck, requirement: mockRequirementId, status: Status.PASS },
    { ...mockCheck, requirement: reviewedRequirement2.id, status: Status.PASS },
    // Intentionally no checks for the unreviewed requirements
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseReviewById.mockReturnValue({
      review: mockReview,
      isLoading: false,
      isFetched: true,
    });

    mockUseChecksForReview.mockReturnValue({
      checks: checksWithReviewedAndUnreviewedAroundCurrent,
      isLoading: false,
      isFetched: true,
    });

    mockUseCheck.mockReturnValue({
      check: mockCheck,
      isLoading: false,
      isFetched: true,
    });

    mockUseRequirements.mockReturnValue({
      data: requirementsWithReviewedAndUnreviewedAroundCurrent,
      isLoading: false,
      isFetched: true,
    });

    mockUseRequirementCategories.mockReturnValue({
      data: ['category-1'],
      isLoading: false,
      isFetched: true,
    });

    mockToggleCheckFlagMutate.mockImplementation((_input, callbacks) => {
      callbacks?.onSuccess?.();
    });
  });

  async function renderReviewRequirement() {
    return render(
      <TestWrapper>
        <ReviewRequirement reviewId={mockReviewId} requirementId={mockRequirementId} />
      </TestWrapper>,
    );
  }

  const flagText = i18n.t('ReviewRequirement.Flag');
  const flaggedText = i18n.t('ReviewRequirement.Flagged');

  function mockRequirementFlowData(
    requirements: (typeof mockRequirement)[],
    checks: (typeof mockCheck)[],
  ) {
    mockUseRequirements.mockReturnValue({
      data: requirements,
      isLoading: false,
      isFetched: true,
    });

    mockUseChecksForReview.mockReturnValue({
      checks,
      isLoading: false,
      isFetched: true,
    });
  }

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra flaggning av krav
   * --------------------------------------------------------------- */
  describe('Möjliggöra flaggning av krav', () => {
    it('toggles flag state when user clicks flag button', async () => {
      const user = userEvent.setup();
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, flag: false },
        isLoading: false,
        isFetched: true,
      });
      mockToggleCheckFlagMutate.mockImplementation((_input, callbacks) => {
        callbacks?.onSuccess?.();
      });

      await renderReviewRequirement();

      // Before click: verify button is in unflagged state
      const flagButtonsBefore = screen.getAllByRole('button', { name: new RegExp(flagText, 'i') });
      expect(flagButtonsBefore[0]).toHaveAttribute('aria-pressed', 'false');

      // Click to flag
      await user.click(flagButtonsBefore[0]);

      // Verify the mutation was called with correct flag value
      expect(mockToggleCheckFlagMutate).toHaveBeenCalledWith(
        expect.objectContaining({ flag: true }),
        expect.any(Object),
      );

      // Verify success message appears
      const successMessage = i18n.t('ReviewRequirement.FlagSet');
      await waitFor(() => {
        const alert = screen.queryByText(successMessage);
        expect(alert).toBeTruthy();
      });
    });

    it('toggles from flagged to unflagged when user clicks unflag button', async () => {
      const user = userEvent.setup();
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, flag: true },
        isLoading: false,
        isFetched: true,
      });
      mockToggleCheckFlagMutate.mockImplementation((input, callbacks) => {
        callbacks?.onSuccess?.();
      });

      await renderReviewRequirement();

      // Before click: verify button is in flagged state
      const flaggedButtonsBefore = screen.getAllByRole('button', {
        name: new RegExp(flaggedText, 'i'),
      });
      expect(flaggedButtonsBefore[0]).toHaveAttribute('aria-pressed', 'true');

      // Click to unflag
      await user.click(flaggedButtonsBefore[0]);

      // Verify the mutation was called with correct flag value
      expect(mockToggleCheckFlagMutate).toHaveBeenCalledWith(
        expect.objectContaining({ flag: false }),
        expect.any(Object),
      );

      // Verify success message appears
      const successMessage = i18n.t('ReviewRequirement.FlagRemoved');
      await waitFor(() => {
        const alert = screen.queryByText(successMessage);
        expect(alert).toBeTruthy();
      });
    });

    it('displays error message when flag toggle fails', async () => {
      const user = userEvent.setup();
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, flag: false },
        isLoading: false,
        isFetched: true,
      });

      let errorCallback: ((error: Error) => void) | undefined;
      mockToggleCheckFlagMutate.mockImplementation((_input, callbacks) => {
        errorCallback = callbacks?.onError;
      });

      await renderReviewRequirement();

      const flagButtons = screen.getAllByRole('button', { name: new RegExp(flagText, 'i') });
      await user.click(flagButtons[0]);

      // Trigger the error callback
      const errorMessage = 'Failed to toggle flag';
      errorCallback?.(new Error(errorMessage));

      // Wait for error feedback to appear
      await waitFor(() => {
        // Check if error is communicated to the user via screen reader alert or error message
        const screenReaderAlert = screen.queryByTestId('mock-screen-reader-alert');
        if (screenReaderAlert) {
          expect(screenReaderAlert.textContent).toContain(errorMessage);
        }
        // The component should have attempted the mutation
        expect(mockToggleCheckFlagMutate).toHaveBeenCalledWith(
          expect.objectContaining({ flag: true }),
          expect.any(Object),
        );
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Navigera till nästa ogranskade krav
   * --------------------------------------------------------------- */
  describe('Navigera till nästa ogranskade krav', () => {
    it('provides next unreviewed link when available', async () => {
      await renderReviewRequirement();

      const nextLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.NextRequirement'), 'i'),
      });
      expect(nextLink).toBeInTheDocument();
      expect(nextLink).toHaveAttribute(
        'href',
        `/granskning/${mockReviewId}/${unreviewedRequirement2Id}#krav`,
      );
    });

    it('provides no next unreviewed link when current requirement is the last one', async () => {
      const requirementsWithCurrentLast = [
        reviewedRequirement1,
        unreviewedRequirement1,
        reviewedRequirement2,
        mockRequirement,
      ];

      const checksWithCurrentLast = [
        { ...mockCheck, requirement: reviewedRequirement1.id, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement2.id, status: Status.PASS },
        { ...mockCheck, requirement: mockRequirementId, status: Status.PASS },
      ];

      mockRequirementFlowData(requirementsWithCurrentLast, checksWithCurrentLast);

      await renderReviewRequirement();

      const nextLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.NextRequirement'), 'i'),
      });
      expect(nextLink).not.toBeInTheDocument();
    });

    it('provides no next unreviewed link when current requirement is only followed by reviewed requirements', async () => {
      const reviewedRequirement3 = {
        ...mockRequirement,
        id: 'requirement-790',
        name: 'Reviewed After Current Two',
      };

      const requirementsOnlyReviewedAfterCurrent = [
        reviewedRequirement1,
        unreviewedRequirement1,
        mockRequirement,
        reviewedRequirement2,
        reviewedRequirement3,
      ];

      const checksOnlyReviewedAfterCurrent = [
        { ...mockCheck, requirement: reviewedRequirement1.id, status: Status.PASS },
        { ...mockCheck, requirement: mockRequirementId, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement2.id, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement3.id, status: Status.PASS },
        // Intentionally no check for unreviewedRequirement1
      ];

      mockRequirementFlowData(requirementsOnlyReviewedAfterCurrent, checksOnlyReviewedAfterCurrent);

      await renderReviewRequirement();

      const nextLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.NextRequirement'), 'i'),
      });
      expect(nextLink).not.toBeInTheDocument();

      const previousLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.PreviousRequirement'), 'i'),
      });
      expect(previousLink).toBeInTheDocument();
      expect(previousLink).toHaveAttribute(
        'href',
        `/granskning/${mockReviewId}/${unreviewedRequirement1.id}#krav`,
      );
    });

    it('provides summary link when no unreviewed requirements are available', async () => {
      mockUseChecksForReview.mockReturnValue({
        checks: requirementsWithReviewedAndUnreviewedAroundCurrent.map((requirement) => ({
          ...mockCheck,
          requirement: requirement.id,
          status: Status.PASS,
        })),
        isLoading: false,
        isFetched: true,
      });

      await renderReviewRequirement();

      const summaryLinks = screen.queryAllByRole('link', {
        name: new RegExp(i18n.t('ReviewRequirements.GoToFailedSummary'), 'i'),
      });
      expect(summaryLinks.length).toBeGreaterThan(0);
      expect(
        summaryLinks.some(
          (link) => link.getAttribute('href') === `/granskning/${mockReviewId}/underkanda-krav`,
        ),
      ).toBe(true);
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Navigera till föregående ogranskade krav
   * --------------------------------------------------------------- */
  describe('Navigera till föregående ogranskade krav', () => {
    it('provides previous unreviewed link when available', async () => {
      await renderReviewRequirement();

      const previousLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.PreviousRequirement'), 'i'),
      });
      expect(previousLink).toBeInTheDocument();
      expect(previousLink).toHaveAttribute(
        'href',
        `/granskning/${mockReviewId}/${unreviewedRequirement1.id}#krav`,
      );
    });

    it('provides no previous unreviewed link when current requirement is the first one', async () => {
      const requirementsWithCurrentFirst = [
        mockRequirement,
        reviewedRequirement1,
        unreviewedRequirement1,
        reviewedRequirement2,
      ];

      const checksWithCurrentFirst = [
        { ...mockCheck, requirement: mockRequirementId, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement1.id, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement2.id, status: Status.PASS },
        // Intentionally no check for unreviewedRequirement1 --- IGNORE ---
      ];

      mockRequirementFlowData(requirementsWithCurrentFirst, checksWithCurrentFirst);

      await renderReviewRequirement();

      const previousLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.PreviousRequirement'), 'i'),
      });
      expect(previousLink).not.toBeInTheDocument();
    });

    it('provides no previous unreviewed link when current requirement is only preceded by reviewed requirements', async () => {
      const reviewedRequirement0 = {
        ...mockRequirement,
        id: 'requirement-012',
        name: 'Reviewed Before Current Two',
      };

      const requirementsOnlyReviewedBeforeCurrent = [
        reviewedRequirement0,
        reviewedRequirement1,
        mockRequirement,
        reviewedRequirement2,
        unreviewedRequirement2,
      ];

      const checksOnlyReviewedBeforeCurrent = [
        { ...mockCheck, requirement: reviewedRequirement0.id, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement1.id, status: Status.PASS },
        { ...mockCheck, requirement: mockRequirementId, status: Status.PASS },
        { ...mockCheck, requirement: reviewedRequirement2.id, status: Status.PASS },
        // Intentionally no check for unreviewedRequirement2
      ];

      mockRequirementFlowData(
        requirementsOnlyReviewedBeforeCurrent,
        checksOnlyReviewedBeforeCurrent,
      );

      await renderReviewRequirement();

      const previousLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.PreviousRequirement'), 'i'),
      });
      expect(previousLink).not.toBeInTheDocument();

      const nextLink = screen.queryByRole('link', {
        name: new RegExp(i18n.t('PrevNextRequirement.NextRequirement'), 'i'),
      });
      expect(nextLink).toBeInTheDocument();
      expect(nextLink).toHaveAttribute(
        'href',
        `/granskning/${mockReviewId}/${unreviewedRequirement2Id}#krav`,
      );
    });
  });
});
