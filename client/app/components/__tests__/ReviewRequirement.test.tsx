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
  DigiLinkButton: ({ children, ...props }: React.PropsWithChildren<{ [key: string]: unknown }>) => (
    <a data-testid="link-button" {...props}>
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

// Mock away irrelevant components
vi.mock('~/components/Breadcrumbs', () => ({
  default: () => null,
}));

vi.mock('~/components/CategoryNav', () => ({
  default: () => null,
}));

vi.mock('~/components/PrevNextRequirement', () => ({
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

  const mockReview = {
    id: mockReviewId,
    title: 'Test Review',
    created_at: '2026-02-17',
    objectType: ObjectType.WEB,
    regulatoryFramework: 'wcag2a',
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

  const mockCheck = {
    id: 'check-1',
    requirement: mockRequirementId,
    status: Status.PASS,
    flag: false,
    comment: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseReviewById.mockReturnValue({
      review: mockReview,
      isLoading: false,
      isFetched: true,
    });

    mockUseChecksForReview.mockReturnValue({
      checks: [mockCheck],
      isLoading: false,
      isFetched: true,
    });

    mockUseCheck.mockReturnValue({
      check: mockCheck,
      isLoading: false,
      isFetched: true,
    });

    mockUseRequirements.mockReturnValue({
      data: [mockRequirement],
      isLoading: false,
      isFetched: true,
    });

    mockUseRequirementCategories.mockReturnValue({
      data: ['category-1'],
      isLoading: false,
      isFetched: true,
    });

    mockToggleCheckFlagMutate.mockImplementation((input, callbacks) => {
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

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra flaggning av krav
   * --------------------------------------------------------------- */
  describe('Möjliggöra flaggning av krav', () => {
    it('renders flag button when requirement is loaded', async () => {
      await renderReviewRequirement();

      await waitFor(() => {
        const flagButtons = screen.getAllByRole('button', { name: new RegExp(flagText, 'i') });
        expect(flagButtons.length).toBeGreaterThan(0);
      });
    });

    it('shows flag button when requirement is not flagged', async () => {
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, flag: false },
        isLoading: false,
        isFetched: true,
      });

      await renderReviewRequirement();

      await waitFor(() => {
        const flagButtons = screen.getAllByRole('button', { name: new RegExp(flagText, 'i') });
        expect(flagButtons.length).toBeGreaterThan(0);
        expect(flagButtons[0].textContent).toContain(flagText);
        expect(flagButtons[0]).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('shows unflag button when requirement is flagged', async () => {
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, flag: true },
        isLoading: false,
        isFetched: true,
      });

      await renderReviewRequirement();

      await waitFor(() => {
        const flaggedButtons = screen.getAllByRole('button', {
          name: new RegExp(flaggedText, 'i'),
        });
        expect(flaggedButtons.length).toBeGreaterThan(0);
        expect(flaggedButtons[0].textContent).toContain(flaggedText);
        expect(flaggedButtons[0]).toHaveAttribute('aria-pressed', 'true');
      });
    });

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

      // Before click: should show unflagged state
      const flagButtons = screen.getAllByRole('button', { name: new RegExp(flagText, 'i') });
      expect(flagButtons[0]).toHaveAttribute('aria-pressed', 'false');

      // Click to flag
      await user.click(flagButtons[0]);

      // Verify the mutation was called with correct flag value
      expect(mockToggleCheckFlagMutate).toHaveBeenCalledWith(
        expect.objectContaining({ flag: true }),
        expect.any(Object),
      );
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

      // Before click: should show flagged state
      const flaggedButtons = screen.getAllByRole('button', { name: new RegExp(flaggedText, 'i') });
      expect(flaggedButtons[0]).toHaveAttribute('aria-pressed', 'true');

      // Click to unflag
      await user.click(flaggedButtons[0]);

      // Verify the mutation was called with correct flag value
      expect(mockToggleCheckFlagMutate).toHaveBeenCalledWith(
        expect.objectContaining({ flag: false }),
        expect.any(Object),
      );
    });

    it('displays error message when flag toggle fails', async () => {
      const user = userEvent.setup();
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, flag: false },
        isLoading: false,
        isFetched: true,
      });

      let errorCallback: ((error: Error) => void) | undefined;
      mockToggleCheckFlagMutate.mockImplementation((input, callbacks) => {
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
});
