import '@testing-library/jest-dom/vitest';

import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Requirement, ReviewSummary } from '../../data/types';
import { ObjectType } from '../../data/types';
import i18next from '../../lang/i18n';
import { ReviewsList } from '../ReviewsList';

// #region MOCKS
/* ---------------------------------------------------------------
 * MOCKS
 * We need to mock various hooks and components to isolate the ReviewsList
 * component for testing. Also, components from the design system are
 * mocked to simple divs or basic elements because shadow DOM encapsulation
 * hides their internal structure from testing-library queries.
 * There is also mocked data and helper functions to create consistent query results for testing.
 * --------------------------------------------------------------- */

// Mock react-router
vi.mock('react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

// Mock hooks
vi.mock('../../hooks/useReviewData', () => ({
  useReviews: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    isFetched: true,
    isSuccess: true,
    isError: false,
    isPending: false,
    status: 'success' as const,
    fetchStatus: 'idle' as const,
    refetch: vi.fn(),
    dataUpdatedAt: MOCK_TIMESTAMP,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isInitialLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
  })),
}));

vi.mock('../../hooks/useRequirementData', () => ({
  useRequirements: vi.fn(() => ({
    data: [],
    isLoading: false,
    isFetched: true,
    isSuccess: true,
    isError: false,
    isPending: false,
    status: 'success' as const,
    fetchStatus: 'idle' as const,
    error: null,
    refetch: vi.fn(),
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isInitialLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
  })),
}));

// Mock Digi components
vi.mock('@designsystem-se/af-react', async () => {
  const actual = await vi.importActual('@designsystem-se/af-react');
  return {
    ...actual,
    DigiTypography: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiTypographyHeadingJumbo: ({ afText }: { afText: string }) => <h1>{afText}</h1>,
    DigiTypographyPreamble: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
    DigiLayoutContainer: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiLayoutBlock: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiLoaderSkeleton: () => <div data-testid="loader-skeleton" />,
    DigiLink: ({ children, afHref }: React.PropsWithChildren<{ afHref?: string }>) => (
      <a href={afHref}>{children}</a>
    ),
    DigiTable: ({ children }: React.PropsWithChildren<{ afSize?: string }>) => (
      <div data-testid="digi-table">{children}</div>
    ),
    DigiLinkButton: ({
      children,
      afHref,
    }: React.PropsWithChildren<{
      afHref?: string;
      afVariation?: string;
    }>) => <a href={afHref}>{children}</a>,
    DigiContextMenu: ({
      afTitle,
    }: {
      afTitle?: string;
      afMenuPosition?: string;
      afMenuItems?: Array<{ id: number; title: string }>;
      onAfChangeItem?: (e: { detail: { item: { id: number } } }) => void;
    }) => <div data-testid="context-menu">{afTitle}</div>,
    DigiNavigationPagination: () => <div data-testid="pagination">Pagination</div>,
    DigiFormFilter: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiNotificationAlert: ({
      children,
    }: React.PropsWithChildren<{
      afType?: string;
      afVariation?: string;
      onAfOnClick?: () => void;
    }>) => <div data-testid="notification-alert">{children}</div>,
    DigiButton: ({
      children,
      onClick,
      afAriaLabel,
      afAriaPressed,
      ...props
    }: React.PropsWithChildren<{
      onClick?: () => void;
      afAriaLabel?: string;
      afAriaPressed?: boolean;
      afFullWidth?: boolean;
    }>) => (
      <button onClick={onClick} aria-label={afAriaLabel} aria-pressed={afAriaPressed} {...props}>
        {children}
      </button>
    ),
    DigiFormCheckbox: ({
      afLabel,
      afChecked,
      onAfOnChange,
    }: {
      afLabel?: string;
      afChecked?: boolean;
      onAfOnChange?: (e: { detail: { target: { checked: boolean } } }) => void;
    }) => {
      const [checked, setChecked] = React.useState(afChecked || false);

      React.useEffect(() => {
        setChecked(afChecked || false);
      }, [afChecked]);

      return (
        <input
          type="checkbox"
          data-testid="favorites-checkbox"
          aria-label={afLabel}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            onAfOnChange?.({ detail: { target: { checked: e.target.checked } } });
          }}
        />
      );
    },
    DigiFormInputSearch: ({
      afLabel,
      afValue,
      afButtonText,
      onAfOnSubmitSearch,
    }: {
      afLabel?: string;
      afValue?: string;
      afButtonText?: string;
      onAfOnSubmitSearch?: (e: { detail: string }) => void;
    }) => {
      const [value, setValue] = React.useState(afValue || '');
      return (
        <div>
          <label htmlFor="search-input">{afLabel}</label>
          <input
            id="search-input"
            type="search"
            aria-label={afLabel}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onAfOnSubmitSearch?.({ detail: value });
              }
            }}
          />
          <button type="button" onClick={() => onAfOnSubmitSearch?.({ detail: value })}>
            {afButtonText}
          </button>
        </div>
      );
    },
    DigiIconChevronRight: () => <span>→</span>,
    DigiIconEdit: () => <span>✎</span>,
    DigiIconHeart: () => <span>♡</span>,
    DigiIconHeartSolid: () => <span>♥</span>,
  };
});

const renderReviewsList = () => {
  return render(
    <BrowserRouter>
      <ReviewsList />
    </BrowserRouter>,
  );
};

const MOCK_TIMESTAMP = 1704096000000; // Fixed timestamp for consistent tests

// Global mock reviews used across all tests
const MOCK_REVIEWS: ReviewSummary[] = [
  {
    id: 1,
    title: 'Amor vincit omnia',
    created_at: '2024-01-15T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 2,
    title: 'Carpe diem',
    created_at: '2024-01-16T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 3,
    title: 'In vino veritas',
    created_at: '2024-01-15T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 4,
    title: 'Per aspera',
    created_at: '2024-01-16T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 5,
    title: 'Memento mori',
    created_at: '2024-01-15T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 6,
    title: 'Nil desperandum',
    created_at: '2024-01-16T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 7,
    title: 'Omnia vincit amor',
    created_at: '2024-01-15T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 8,
    title: 'Homo sum',
    created_at: '2024-01-16T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 9,
    title: 'Gaudeamus igitur',
    created_at: '2024-01-15T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 10,
    title: 'Lorem ipsum',
    created_at: '2024-01-16T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 11,
    title: 'Dolor sit amet',
    created_at: '2024-01-10T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 12,
    title: 'Dum spiro spero',
    created_at: '2024-01-20T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 13,
    title: 'Lux aeterna',
    created_at: '2024-01-10T10:00:00Z',
    latestUpdate: '2024-01-25T10:00:00Z',
    reviewedCount: 5,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 14,
    title: 'Fortuna favet',
    created_at: '2024-01-20T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 10,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 15,
    title: 'Tempus fugit',
    created_at: '2024-01-15T10:00:00Z',
    latestUpdate: '2024-01-20T10:00:00Z',
    reviewedCount: 3,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
  {
    id: 16,
    title: 'Ubi bene',
    created_at: '2024-01-16T10:00:00Z',
    latestUpdate: '2024-01-21T10:00:00Z',
    reviewedCount: 15,
    objectType: ObjectType.WEB,
    regulatoryFramework: '',
    excludedContentTypes: null,
    selectedPrefillIds: null,
    passCount: 0,
    failCount: 0,
    irrelevantCount: 0,
  },
];

// Helper functions to create mock query results
const createMockReviewsQuery = (
  data: ReviewSummary[] = [],
  overrides: Partial<UseQueryResult<ReviewSummary[], Error>> = {},
): UseQueryResult<ReviewSummary[], Error> => ({
  ...overrides,
  data,
  isLoading: false,
  error: null,
  isFetched: true,
  isSuccess: true,
  isError: false,
  isPending: false,
  status: 'success',
  fetchStatus: 'idle',
  refetch: vi.fn(),
  dataUpdatedAt: MOCK_TIMESTAMP,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isInitialLoading: false,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
  isFetchedAfterMount: true,
  isFetching: false,
  isEnabled: true,
  promise: Promise.resolve(data),
});

const createMockRequirementsQuery = (
  data: Requirement[] = [],
  overrides: Partial<UseQueryResult<Requirement[], Error>> = {},
): UseQueryResult<Requirement[], Error> =>
  ({
    data,
    isLoading: false,
    isFetched: true,
    isSuccess: true,
    isError: false,
    isPending: false,
    status: 'success',
    fetchStatus: 'idle',
    error: null,
    refetch: vi.fn(),
    dataUpdatedAt: MOCK_TIMESTAMP,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isInitialLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isFetchedAfterMount: true,
    isFetching: false,
    isEnabled: true,
    promise: Promise.resolve(data),
    ...overrides,
  }) as UseQueryResult<Requirement[], Error>;
// #endregion MOCKS

/* ---------------------------------------------------------------
 * TESTS
 * --------------------------------------------------------------- */

describe('ReviewsList', () => {
  // Setup
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  /* ---------------------------------------------------------------
   * Rendering and basic interactions
   * --------------------------------------------------------------- */
  describe('Rendering and basic interactions', () => {
    it('renders the component with title and preamble', () => {
      renderReviewsList();

      expect(screen.getByText(i18next.t('Home.Title'))).toBeInTheDocument();
      expect(screen.getByText(i18next.t('Home.Preamble'), { exact: false })).toBeInTheDocument();
    });

    it('renders create review button', () => {
      renderReviewsList();

      const createButton = screen.getByText(i18next.t('Home.CreateReview'));
      expect(createButton).toBeInTheDocument();
    });

    it('shows loading state when data is loading', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      vi.mocked(useReviews).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isFetched: false,
      } as UseQueryResult<ReviewSummary[], Error>);

      renderReviewsList();

      expect(screen.getByTestId('loader-skeleton')).toBeInTheDocument();
    });

    it('shows error message when there is an error', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      vi.mocked(useReviews).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Test error'),
        isFetched: true,
      } as UseQueryResult<ReviewSummary[], Error>);

      renderReviewsList();

      expect(screen.getByText(i18next.t('ReviewsList.LoadingError'))).toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa en lista med alla granskningar.
   * - renders empty list when no reviews exist
   * - renders list with reviews
   * --------------------------------------------------------------- */
  describe('Visa en lista med alla granskningar', () => {
    it('renders empty list when no reviews exist', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery([]));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      renderReviewsList();

      expect(screen.getByText(`0 ${i18next.t('ReviewsList.ItemsName')}`)).toBeInTheDocument();

      // Verify table has 0 data rows (plus 1 header row = 1 total)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1);
    });

    it('renders list with reviews', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      renderReviewsList();

      expect(
        screen.getByText(`${MOCK_REVIEWS.length} ${i18next.t('ReviewsList.ItemsName')}`),
      ).toBeInTheDocument();

      // Component has pagination with 10 items per page, so verify first page (10 rows + 1 header = 11)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(11); // 10 reviews + 1 header row

      // Verify that reviews are present (component sorts by created_at descending by default)
      const sortedReviews = [...MOCK_REVIEWS].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      sortedReviews.slice(0, 10).forEach((review) => {
        expect(screen.queryAllByText(review.title).length).toBeGreaterThan(0);
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra sökning efter granskningar.
   * --------------------------------------------------------------- */

  describe('Möjliggöra sökning efter granskningar', () => {
    it('sets url params when filters change', async () => {
      const { useSearchParams } = await import('react-router-dom');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Spy on window.history.replaceState
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      const user = userEvent.setup();
      renderReviewsList();

      // Wait for the search input to appear
      const searchInput = await screen.findByLabelText(i18next.t('ReviewsList.SearchLabel'));
      await user.type(searchInput, 'test{enter}');

      // Verify that window.history.replaceState was called with the search parameter
      await waitFor(() => {
        expect(replaceStateSpy).toHaveBeenCalled();
        const lastCall = replaceStateSpy.mock.calls[replaceStateSpy.mock.calls.length - 1];
        const url = lastCall[2] as string;
        expect(url).toContain('sok=test');
      });

      replaceStateSpy.mockRestore();
    });

    it('filters reviews by title from url params', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Set up the component with search params
      const mockSearchParams = new URLSearchParams('sok=amor');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Verify both reviews including the text "amor" are visible
      expect(screen.queryAllByText(/Amor vincit omnia/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Omnia vincit amor/i).length).toBeGreaterThan(0);

      // Verify other reviews are NOT visible
      expect(screen.queryByText(/Carpe diem/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/In vino veritas/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Per aspera/i)).not.toBeInTheDocument();

      // Verify that the total count reflects the filtered results
      expect(
        screen.getByText(
          `2 ${i18next.t('ReviewsList.ItemsName')} ${i18next.t('CardsOrTable.Found')}`,
        ),
      ).toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra sortering av granskningar
   * --------------------------------------------------------------- */
  describe('Möjliggöra sortering av granskningar', () => {
    it('sorts reviews by name ascending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=1&riktning=stigande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract titles from rows (skip header row)
        const displayedTitles = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Title is in the second cell (index 1)
            return cells[1]?.textContent?.replace(/^→\s*/, '').trim() || '';
          })
          .filter((title) => title.length > 0);

        // Create expected sorted order
        const expectedTitles = [...MOCK_REVIEWS]
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, 10) // First page with 10 items
          .map((r) => r.title);

        // Verify all titles are present and in correct order
        expect(displayedTitles.length).toBe(10);
        displayedTitles.forEach((title, index) => {
          expect(title).toBe(expectedTitles[index]);
        });

        // Verify alphabetical order
        for (let i = 0; i < displayedTitles.length - 1; i++) {
          expect(displayedTitles[i].localeCompare(displayedTitles[i + 1])).toBeLessThanOrEqual(0);
        }

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingReviewName')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="ascending"
        const headers = screen.getAllByRole('columnheader');
        const nameHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingReviewName')),
        );
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      });
    });

    it('sorts reviews by name descending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=1&riktning=fallande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract titles from rows (skip header row)
        const displayedTitles = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Title is in the second cell (index 1)
            return cells[1]?.textContent?.replace(/^→\s*/, '').trim() || '';
          })
          .filter((title) => title.length > 0);

        // Create expected sorted order
        const expectedTitles = [...MOCK_REVIEWS]
          .sort((a, b) => b.title.localeCompare(a.title))
          .slice(0, 10) // First page with 10 items
          .map((r) => r.title);

        // Verify all titles are present and in correct order
        expect(displayedTitles.length).toBe(10);
        displayedTitles.forEach((title, index) => {
          expect(title).toBe(expectedTitles[index]);
        });

        // Verify alphabetical order
        for (let i = 0; i < displayedTitles.length - 1; i++) {
          expect(displayedTitles[i].localeCompare(displayedTitles[i + 1])).toBeGreaterThanOrEqual(
            0,
          );
        }

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingReviewName')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="descending"
        const headers = screen.getAllByRole('columnheader');
        const nameHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingReviewName')),
        );
        expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
      });
    });

    it('sorts reviews by created date ascending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=2&riktning=stigande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract dates from rows (skip header row)
        const displayedDates = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Created date is in the third cell (index 2)
            return cells[2]?.textContent?.trim() || '';
          })
          .filter((date) => date.length > 0)
          .map((dateStr) => new Date(dateStr).getTime());

        // Verify we have 10 reviews displayed
        expect(displayedDates.length).toBe(10);

        // Verify chronological order (older dates first)
        for (let i = 0; i < displayedDates.length - 1; i++) {
          expect(displayedDates[i]).toBeLessThanOrEqual(displayedDates[i + 1]);
        }

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingCreated')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="ascending"
        const headers = screen.getAllByRole('columnheader');
        const createdHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingCreated')),
        );
        expect(createdHeader).toHaveAttribute('aria-sort', 'ascending');
      });
    });

    it('sorts reviews by created date descending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=2&riktning=fallande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract dates from rows (skip header row)
        const displayedDates = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Created date is in the third cell (index 2)
            return cells[2]?.textContent?.trim() || '';
          })
          .filter((date) => date.length > 0)
          .map((dateStr) => new Date(dateStr).getTime());

        // Verify we have 10 reviews displayed
        expect(displayedDates.length).toBe(10);

        // Verify chronological order (newer dates first)
        for (let i = 0; i < displayedDates.length - 1; i++) {
          expect(displayedDates[i]).toBeGreaterThanOrEqual(displayedDates[i + 1]);
        }

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingCreated')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="descending"
        const headers = screen.getAllByRole('columnheader');
        const createdHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingCreated')),
        );
        expect(createdHeader).toHaveAttribute('aria-sort', 'descending');
      });
    });

    it('sorts reviews by updated date ascending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=3&riktning=stigande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract dates from rows (skip header row)
        const displayedDates = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Updated date is in the fourth cell (index 3)
            return cells[3]?.textContent?.trim() || '';
          })
          .filter((date) => date.length > 0)
          .map((dateStr) => new Date(dateStr).getTime());

        // Verify we have 10 reviews displayed
        expect(displayedDates.length).toBe(10);

        // Verify chronological order (older updates first)
        for (let i = 0; i < displayedDates.length - 1; i++) {
          expect(displayedDates[i]).toBeLessThanOrEqual(displayedDates[i + 1]);
        }

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingUpdated')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="ascending"
        const headers = screen.getAllByRole('columnheader');
        const updatedHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingUpdated')),
        );
        expect(updatedHeader).toHaveAttribute('aria-sort', 'ascending');
      });
    });

    it('sorts reviews by updated date descending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=3&riktning=fallande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract dates from rows (skip header row)
        const displayedDates = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Updated date is in the fourth cell (index 3)
            return cells[3]?.textContent?.trim() || '';
          })
          .filter((date) => date.length > 0)
          .map((dateStr) => new Date(dateStr).getTime());

        // Verify we have 10 reviews displayed
        expect(displayedDates.length).toBe(10);

        // Verify chronological order (newer dates first)
        for (let i = 0; i < displayedDates.length - 1; i++) {
          expect(displayedDates[i]).toBeGreaterThanOrEqual(displayedDates[i + 1]);
        }

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingUpdated')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="descending"
        const headers = screen.getAllByRole('columnheader');
        const updatedHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingUpdated')),
        );
        expect(updatedHeader).toHaveAttribute('aria-sort', 'descending');
      });
    });

    it('sorts reviews by reviewed count ascending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=4&riktning=stigande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Sort mock data to determine expected top 10
      const sortedByCount = [...MOCK_REVIEWS].sort((a, b) => a.reviewedCount - b.reviewedCount);
      const expectedTop10Counts = sortedByCount.slice(0, 10).map((r) => r.reviewedCount);

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract reviewed counts from rows (skip header row)
        const displayedCounts = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Reviewed count is in the fifth cell (index 4)
            const countText = cells[4]?.textContent?.trim() || '';
            return parseInt(countText, 10);
          })
          .filter((count) => !isNaN(count));

        // Verify we have 10 reviews displayed
        expect(displayedCounts.length).toBe(10);

        // Verify ascending order (lowest counts first)
        for (let i = 0; i < displayedCounts.length - 1; i++) {
          expect(displayedCounts[i]).toBeLessThanOrEqual(displayedCounts[i + 1]);
        }

        // Verify the correct items are displayed (top 10 by count)
        expect(displayedCounts).toEqual(expectedTop10Counts);

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingReviewed')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="ascending"
        const headers = screen.getAllByRole('columnheader');
        const reviewedHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingReviewed')),
        );
        expect(reviewedHeader).toHaveAttribute('aria-sort', 'ascending');
      });
    });

    it('sorts reviews by reviewed count descending', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('sortering=4&riktning=fallande');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Sort mock data to determine expected top 10
      const sortedByCount = [...MOCK_REVIEWS].sort((a, b) => b.reviewedCount - a.reviewedCount);
      const expectedTop10Counts = sortedByCount.slice(0, 10).map((r) => r.reviewedCount);

      // Wait for component to process sorting
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Extract reviewed counts from rows (skip header row)
        const displayedCounts = rows
          .slice(1)
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            // Reviewed count is in the fifth cell (index 4)
            const countText = cells[4]?.textContent?.trim() || '';
            return parseInt(countText, 10);
          })
          .filter((count) => !isNaN(count));

        // Verify we have 10 reviews displayed
        expect(displayedCounts.length).toBe(10);

        // Verify descending order (highest counts first)
        for (let i = 0; i < displayedCounts.length - 1; i++) {
          expect(displayedCounts[i]).toBeGreaterThanOrEqual(displayedCounts[i + 1]);
        }

        // Verify the correct items are displayed (top 10 by count)
        expect(displayedCounts).toEqual(expectedTop10Counts);

        // Verify sort button has aria-pressed="true" (use getAllByRole since there are mobile + desktop buttons)
        const sortButtons = screen.getAllByRole('button', {
          name: new RegExp(i18next.t('ReviewsList.HeadingReviewed')),
        });
        expect(sortButtons[0]).toHaveAttribute('aria-pressed', 'true');

        // Verify th has aria-sort="descending"
        const headers = screen.getAllByRole('columnheader');
        const reviewedHeader = headers.find((header) =>
          header.getAttribute('aria-label')?.includes(i18next.t('ReviewsList.HeadingReviewed')),
        );
        expect(reviewedHeader).toHaveAttribute('aria-sort', 'descending');
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra favoritmarkering av granskningar
   * --------------------------------------------------------------- */
  describe('Möjliggöra favoritmarkering av granskningar', () => {
    it('renders favorites checkbox', () => {
      renderReviewsList();

      const checkbox = screen.getByTestId('favorites-checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('aria-label', i18next.t('ReviewsList.ShowFavorites'));
    });

    it('sets favorites filter from URL parameters on mount', async () => {
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Mock useSearchParams to return URL parameters
      const mockSearchParams = new URLSearchParams('favoriter=true');
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);

      renderReviewsList();

      // Wait for useEffect to process URL params
      await waitFor(() => {
        // Verify that the favorites checkbox is checked
        const checkbox = screen.getByTestId('favorites-checkbox');
        expect(checkbox).toBeChecked();
      });
    });

    it('shows only favorites when checkbox is checked', async () => {
      const user = userEvent.setup();
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Reset search params to empty
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()]);

      // Start with one review as favorite
      localStorage.setItem('favoriteReviews', JSON.stringify([1]));

      renderReviewsList();

      // Should show all reviews initially
      const rowsBefore = screen.getAllByRole('row');
      expect(rowsBefore).toHaveLength(11); // 10 reviews + 1 header row

      // Click the favorites checkbox
      const checkbox = screen.getByTestId('favorites-checkbox');
      await user.click(checkbox);

      // Should now only show the favorite review
      await waitFor(() => {
        const rowsAfter = screen.getAllByRole('row');
        expect(rowsAfter).toHaveLength(2); // 1 favorite review + 1 header row

        // Verify the displayed review is the favorite one (id 1 = "Amor vincit omnia")
        const favoriteReview = MOCK_REVIEWS.find((review) => review.id === 1)!;
        const cells = Array.from(rowsAfter[1].querySelectorAll('td'));
        const displayedTitle = cells[1]?.textContent?.replace(/^→\s*/, '').trim();
        expect(displayedTitle).toBe(favoriteReview.title);
      });
    });

    it('adds favorite when heart button is clicked', async () => {
      const user = userEvent.setup();
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Reset search params to empty for this test
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()]);

      renderReviewsList();

      // Initially should show empty heart
      expect(screen.getAllByText('♡').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('♥')).toHaveLength(0);

      // Click favorite button for a review
      const testReview = MOCK_REVIEWS[0];
      const favoriteButtons = screen.getAllByLabelText(
        i18next.t('ReviewsList.FavoriteAdd', { reviewName: testReview.title }),
      );
      await user.click(favoriteButtons[0]);

      // Should now show filled heart
      expect(screen.getAllByText('♥').length).toBeGreaterThan(0);

      // Check localStorage
      const storedFaves = JSON.parse(localStorage.getItem('favoriteReviews') || '[]');
      expect(storedFaves).toContain(testReview.id);
    });

    it('removes favorite when clicking filled heart', async () => {
      const user = userEvent.setup();
      const { useReviews } = await import('../../hooks/useReviewData');
      const { useRequirements } = await import('../../hooks/useRequirementData');

      const testReview = MOCK_REVIEWS.find((review) => review.id === 1);

      vi.mocked(useReviews).mockReturnValue(createMockReviewsQuery(MOCK_REVIEWS));
      vi.mocked(useRequirements).mockReturnValue(createMockRequirementsQuery([]));

      // Start with review as favorite
      localStorage.setItem('favoriteReviews', JSON.stringify([testReview.id]));

      renderReviewsList();

      // Should have aria-pressed=true for favorite button
      const initialButton = screen.getAllByLabelText(
        i18next.t('ReviewsList.FavoriteRemove', { reviewName: testReview.title }),
      )[0];
      expect(initialButton).toHaveAttribute('aria-pressed', 'true');

      // Click to remove favorite
      await user.click(initialButton);

      // Should now have aria-pressed=false
      await waitFor(() => {
        const updatedButton = screen.getAllByLabelText(
          i18next.t('ReviewsList.FavoriteAdd', { reviewName: testReview.title }),
        )[0];
        expect(updatedButton).toHaveAttribute('aria-pressed', 'false');
      });

      // Check localStorage was updated
      const storedFaves = JSON.parse(localStorage.getItem('favoriteReviews') || '[]');
      expect(storedFaves).not.toContain(testReview.id);
      expect(storedFaves.length).toBe(0);
    });
  });
});
