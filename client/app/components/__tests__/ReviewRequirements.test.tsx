import '@testing-library/jest-dom/vitest';

import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import type { Check, Requirement, Review } from '../../data/types';
import { ObjectType, Status } from '../../data/types';
import i18n from '../../lang/i18n';
import ReviewRequirements from '../ReviewRequirements';

// #region MOCKS
/* ---------------------------------------------------------------
 * MOCKS
 * --------------------------------------------------------------- */

// Mock hooks
const mockUseReviewById = vi.fn();
const mockUseChecksForReview = vi.fn();
const mockUseRequirements = vi.fn();
const mockUseRequirementCategories = vi.fn();
const mockNavigate = vi.fn();

// Mock react-router's useNavigate hook
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useReviewData', () => ({
  useReviewById: () => mockUseReviewById(),
  useChecksForReview: () => mockUseChecksForReview(),
}));

vi.mock('../../hooks/useRequirementData', () => ({
  useRequirements: () => mockUseRequirements(),
  useRequirementCategories: () => mockUseRequirementCategories(),
}));

// Mock Digi components
vi.mock('@designsystem-se/af-react', async () => {
  const actual = await vi.importActual('@designsystem-se/af-react');
  return {
    ...actual,
    DigiTypography: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiFormCheckbox: ({
      children,
      afChecked,
      afLabel,
      onAfOnChange,
    }: React.PropsWithChildren<{
      afChecked?: boolean;
      afLabel?: string;
      onAfOnChange?: (e: { detail: { target: { checked: boolean } } }) => void;
    }>) => (
      <label>
        <input
          type="checkbox"
          checked={afChecked}
          onChange={(e) => {
            onAfOnChange?.({ detail: { target: { checked: e.target.checked } } });
          }}
        />
        {afLabel || children}
      </label>
    ),
    DigiLayoutBlock: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiLayoutContainer: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    DigiLink: ({ children, afHref }: React.PropsWithChildren<{ afHref?: string }>) => (
      <a href={afHref}>{children}</a>
    ),
    DigiLinkButton: ({
      children,
      onAfOnClick,
    }: React.PropsWithChildren<{ onAfOnClick?: () => void }>) => (
      <button onClick={onAfOnClick}>{children}</button>
    ),
    DigiLoaderSkeleton: () => <div data-testid="loader-skeleton">Loading...</div>,
    DigiNotificationAlert: ({
      children,
      afHeading,
    }: React.PropsWithChildren<{ afHeading?: string }>) => (
      <div data-testid="notification-alert">
        {afHeading && <h3>{afHeading}</h3>}
        {children}
      </div>
    ),
    DigiNotificationErrorPage: ({ afStatusCode }: { afStatusCode?: number }) => (
      <div data-testid="error-page">Error {afStatusCode}</div>
    ),
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
    }) => (
      <div>
        <label htmlFor="search-input">{afLabel}</label>
        <input
          id="search-input"
          type="search"
          aria-label={afLabel}
          defaultValue={afValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAfOnSubmitSearch?.({ detail: (e.target as HTMLInputElement).value });
            }
          }}
        />
        <button type="button" onClick={() => onAfOnSubmitSearch?.({ detail: afValue || '' })}>
          {afButtonText}
        </button>
      </div>
    ),
    DigiFormFilter: ({
      afFilterButtonText,
      afListItems,
      afCheckItems,
      onAfSubmitFilter,
    }: {
      afFilterButtonText?: string;
      afListItems?: Array<{ id: string; label: string }>;
      afCheckItems?: string[];
      onAfSubmitFilter?: (e: { detail: { checked: string[] } }) => void;
    }) => {
      const [checked, setChecked] = React.useState<string[]>(afCheckItems ?? []);
      return (
        <div data-testid="digi-form-filter">
          <button type="button" onClick={() => onAfSubmitFilter?.({ detail: { checked } })}>
            {afFilterButtonText}
          </button>
          <div>
            {(afListItems ?? []).map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  aria-label={item.label}
                  checked={checked.includes(item.id)}
                  onChange={(e) => {
                    setChecked((prev) =>
                      e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                    );
                  }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      );
    },
    DigiContextMenu: ({ afTitle }: { afTitle?: string }) => (
      <div data-testid="context-menu">{afTitle}</div>
    ),
    DigiNavigationPagination: () => <div data-testid="pagination">Pagination</div>,
    DigiTable: ({ children }: React.PropsWithChildren) => <table>{children}</table>,
    DigiBadgeStatus: ({ afText }: { afText?: string }) => <span>{afText}</span>,
    DigiIconChevronRight: () => <span data-testid="chevron-right">→</span>,
  };
});

vi.mock('../FilledFlag', () => ({
  default: () => <span data-testid="filled-flag">🚩</span>,
}));

vi.mock('../PageTitle', () => ({
  default: ({ children }: React.PropsWithChildren) => <h1>{children}</h1>,
}));

vi.mock('../ProgressBar', () => ({
  default: ({ percentage }: { percentage: number }) => (
    <div data-testid="progress-bar">{percentage}%</div>
  ),
}));

vi.mock('../SortButton', () => ({
  SortButton: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}));

// #endregion MOCKS

// #region MOCK DATA
/* ---------------------------------------------------------------
 * MOCK DATA
 * --------------------------------------------------------------- */

const mockRequirements: Requirement[] = [
  {
    id: '1.1.1',
    name: 'Lorem ipsum',
    regulatoryFramework: 'dos',
    wcag: '1.1.1',
    en301549: '9.1.1.1',
    contentType: 'images',
    category: 'Lorem',
    objectType: ObjectType.WEB,
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
  },
  {
    id: '1.2.1',
    name: 'Dolor sit',
    regulatoryFramework: 'dos',
    wcag: '1.2.1',
    en301549: '9.1.2.1',
    contentType: 'video',
    category: 'Ipsum',
    objectType: ObjectType.WEB,
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
  },
  {
    id: '2.1.1',
    name: 'Aenean commodo',
    regulatoryFramework: 'dos',
    wcag: '2.1.1',
    en301549: '9.2.1.1',
    contentType: 'forms',
    category: 'Dolor',
    objectType: ObjectType.WEB,
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
  },
  {
    id: '2.4.4',
    name: 'Vestibulum ante',
    regulatoryFramework: 'dos',
    wcag: '2.4.4',
    en301549: '9.2.4.4',
    contentType: 'content',
    category: 'Sit',
    objectType: ObjectType.WEB,
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
  },
  {
    id: '3.3.2',
    name: 'Cras mattis',
    regulatoryFramework: 'dos',
    wcag: '3.3.2',
    en301549: '9.3.3.2',
    contentType: 'forms',
    category: 'Lorem',
    objectType: ObjectType.WEB,
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
  },
  {
    id: '4.1.2',
    name: 'Pellentesque habitant',
    regulatoryFramework: 'dos',
    wcag: '4.1.2',
    en301549: '9.4.1.2',
    contentType: 'widgets',
    category: 'Ipsum',
    objectType: ObjectType.WEB,
    statement: 'Test statement',
    why: 'Test why',
    howToTest: 'Test how',
  },
];

const mockCategories = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];

const mockReview: Review = {
  id: 1,
  title: 'Test Review',
  excludedContentTypes: '',
  selectedPrefillIds: '',
  objectType: ObjectType.WEB,
  regulatoryFramework: 'dos',
  created_at: '2024-01-01',
};

const mockChecks: Check[] = [
  {
    id: 1,
    review: 1,
    requirement: '1.1.1',
    status: Status.PASS,
    comment: '',
    flag: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 2,
    review: 1,
    requirement: '1.2.1',
    status: Status.NOT_ASSESSED,
    comment: '',
    flag: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 3,
    review: 1,
    requirement: '2.1.1',
    status: Status.FAIL,
    comment: 'Lorem ipsum dolor sit amet',
    flag: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 4,
    review: 1,
    requirement: '2.4.4',
    status: Status.PASS,
    comment: '',
    flag: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 5,
    review: 1,
    requirement: '3.3.2',
    status: Status.NOT_ASSESSED,
    comment: '',
    flag: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 6,
    review: 1,
    requirement: '4.1.2',
    status: Status.FAIL,
    comment: 'Consectetur adipiscing elit',
    flag: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

// Helper to create query result
function createQueryResult<T>(data: T, overrides = {}): UseQueryResult<T, Error> {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    status: 'success',
    isFetched: true,
    isPending: false,
    fetchStatus: 'idle',
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
    isFetchedAfterMount: true,
    isFetching: false,
    isEnabled: true,
    promise: Promise.resolve(data),
    ...overrides,
  } as UseQueryResult<T, Error>;
}

// #endregion MOCK DATA

// #region HELPER FUNCTIONS
/* ---------------------------------------------------------------
 * HELPER FUNCTIONS
 * --------------------------------------------------------------- */

function renderReviewRequirements(reviewId = '1') {
  // Use the imported MemoryRouter to wrap the component in a router context
  return render(
    <MemoryRouter>
      <ReviewRequirements reviewId={reviewId} />
    </MemoryRouter>,
  );
}

function setupDefaultMocks() {
  mockUseReviewById.mockReturnValue({
    review: mockReview,
    isLoading: false,
    isFetched: true,
  });
  mockUseChecksForReview.mockReturnValue({
    checks: mockChecks,
    isLoading: false,
    isFetched: true,
  });
  mockUseRequirements.mockReturnValue(createQueryResult(mockRequirements));
  mockUseRequirementCategories.mockReturnValue(createQueryResult(mockCategories));
}

function getStatusText(status: Status, plural = false): string {
  const statusMap: Record<Status, string> = {
    [Status.PASS]: 'pass',
    [Status.FAIL]: 'fail',
    [Status.NOT_ASSESSED]: 'notAssessed',
    [Status.IRRELEVANT]: 'irrelevant',
  };
  const key = plural ? 'Plural' : '';
  return i18n.t(`Status.${statusMap[status]}${key}`);
}

// #endregion HELPER FUNCTIONS

describe('ReviewRequirements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa en lista med samtliga krav i granskningen
   * --------------------------------------------------------------- */
  describe('Visa en lista med samtliga krav i granskningen', () => {
    it('renders list with requirements', async () => {
      renderReviewRequirements('1');
      await waitFor(() => {
        expect(
          screen.getByText(`${mockRequirements.length} ${i18n.t('ReviewRequirements.ItemsName')}`),
        ).toBeInTheDocument();
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(mockRequirements.length + 1);
        mockRequirements.forEach((req) => {
          expect(screen.queryAllByText(req.name).length).toBeGreaterThan(0);
        });
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa tillhörande bedömning för varje krav
   * --------------------------------------------------------------- */
  describe('Visa tillhörande bedömning för varje krav', () => {
    it('renders status badges for each requirement', async () => {
      renderReviewRequirements('1');
      await waitFor(() => {
        mockChecks.forEach((check) => {
          const requirement = mockRequirements.find((req) => req.id === check.requirement);
          if (requirement?.name) {
            expect(screen.queryAllByText(requirement.name).length).toBeGreaterThan(0);
          }
          const statusText = getStatusText(check.status as Status);
          expect(screen.queryAllByText(statusText).length).toBeGreaterThan(0);
        });
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa kravkategori för varje krav
   * --------------------------------------------------------------- */
  describe('Visa kravkategori för varje krav', () => {
    it('renders category for each requirement', async () => {
      renderReviewRequirements('1');
      await waitFor(() => {
        mockRequirements.forEach((req) => {
          expect(screen.queryAllByText(req.category).length).toBeGreaterThan(0);
        });
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa eventuell flaggning av krav
   * --------------------------------------------------------------- */
  describe('Visa eventuell flaggning av krav', () => {
    it('renders flag icon for flagged requirements', async () => {
      renderReviewRequirements('1');
      await waitFor(() => {
        mockChecks.forEach((check) => {
          if (check.flag) {
            const requirement = mockRequirements.find((req) => req.id === check.requirement);
            if (requirement?.name) {
              const row = screen.getAllByText(requirement.name)[0].closest('tr');
              expect(row?.querySelector('[data-testid="filled-flag"]')).toBeInTheDocument();
            }
          } else {
            const requirement = mockRequirements.find((req) => req.id === check.requirement);
            if (requirement?.name) {
              const row = screen.getAllByText(requirement.name)[0].closest('tr');
              expect(row?.querySelector('[data-testid="filled-flag"]')).not.toBeInTheDocument();
            }
          }
        });
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Söka bland krav
   * --------------------------------------------------------------- */
  describe('Söka bland krav', () => {
    it('filters requirements based on search input', async () => {
      const user = userEvent.setup();
      renderReviewRequirements('1');
      await waitFor(() => {
        expect(
          screen.getByRole('searchbox', {
            name: i18n.t('ReviewRequirements.SearchLabel'),
          }),
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('searchbox', {
        name: i18n.t('ReviewRequirements.SearchLabel'),
      }) as HTMLInputElement;
      await user.type(searchInput, 'Lorem');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(2);
        const dataRow = rows[1];
        expect(within(dataRow).getByText('Lorem ipsum')).toBeInTheDocument();
        expect(within(dataRow).queryByText('Dolor sit')).not.toBeInTheDocument();
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Filtrera krav
   * --------------------------------------------------------------- */
  describe('Filtrera krav', () => {
    it('filters requirements based on category selection', async () => {
      const user = userEvent.setup();
      renderReviewRequirements('1');

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'Lorem' })).toBeInTheDocument();
      });

      const categoryOption = screen.getByRole('checkbox', { name: 'Lorem' });
      await user.click(categoryOption);

      const applyFilterButton = screen.getByRole('button', {
        name: i18n.t('ReviewRequirements.FilterCategories'),
      });
      await user.click(applyFilterButton);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(3);
        const dataRow1 = rows[1];
        const dataRow2 = rows[2];
        expect(within(dataRow1).getByText('Lorem ipsum')).toBeInTheDocument();
        expect(within(dataRow2).getByText('Cras mattis')).toBeInTheDocument();
        expect(screen.queryByText('Dolor sit')).not.toBeInTheDocument();
      });
    });

    it('filters requirements based on status selection', async () => {
      const user = userEvent.setup();
      renderReviewRequirements('1');

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: i18n.t('Status.pass') })).toBeInTheDocument();
      });

      const statusOption = screen.getByRole('checkbox', { name: i18n.t('Status.pass') });
      await user.click(statusOption);

      const applyFilterButton = screen.getByRole('button', {
        name: i18n.t('ReviewRequirements.FilterStatus'),
      });
      await user.click(applyFilterButton);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(3);
        const dataRow1 = rows[1];
        const dataRow2 = rows[2];
        expect(within(dataRow1).getByText('Lorem ipsum')).toBeInTheDocument();
        expect(within(dataRow2).getByText('Vestibulum ante')).toBeInTheDocument();
        expect(screen.queryByText('Dolor sit')).not.toBeInTheDocument();
      });
    });

    it('filters flagged requirements', async () => {
      const user = userEvent.setup();
      renderReviewRequirements('1');

      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', {
            name: i18n.t('ReviewRequirements.ShowFlaggedRequirements'),
          }),
        ).toBeInTheDocument();
      });

      const flaggedCheckbox = screen.getByRole('checkbox', {
        name: i18n.t('ReviewRequirements.ShowFlaggedRequirements'),
      });
      await user.click(flaggedCheckbox);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(5);
        expect(screen.queryAllByText('Lorem ipsum').length).toBeGreaterThan(0);
        expect(screen.queryAllByText('Dolor sit').length).toBeGreaterThan(0);
        expect(screen.queryAllByText('Aenean commodo').length).toBeGreaterThan(0);
        expect(screen.queryAllByText('Cras mattis').length).toBeGreaterThan(0);
        expect(screen.queryByText('Vestibulum ante')).not.toBeInTheDocument();
        expect(screen.queryByText('Pellentesque habitant')).not.toBeInTheDocument();
      });
    });

    it('filters requirements based on combined category, status and flagging', async () => {
      const user = userEvent.setup();
      renderReviewRequirements('1');

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'Lorem' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: i18n.t('Status.pass') })).toBeInTheDocument();
      });

      const categoryOption = screen.getByRole('checkbox', { name: 'Lorem' });
      await user.click(categoryOption);
      const statusOption = screen.getByRole('checkbox', { name: i18n.t('Status.pass') });
      await user.click(statusOption);
      const flaggedCheckbox = screen.getByRole('checkbox', {
        name: i18n.t('ReviewRequirements.ShowFlaggedRequirements'),
      });
      await user.click(flaggedCheckbox);

      const applyCategoryFilterButton = screen.getByRole('button', {
        name: i18n.t('ReviewRequirements.FilterCategories'),
      });
      await user.click(applyCategoryFilterButton);
      const applyStatusFilterButton = screen.getByRole('button', {
        name: i18n.t('ReviewRequirements.FilterStatus'),
      });
      await user.click(applyStatusFilterButton);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(2);
        const dataRow = rows[1];
        expect(within(dataRow).getByText('Lorem ipsum')).toBeInTheDocument();
        expect(screen.queryByText('Cras mattis')).not.toBeInTheDocument();
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa status för granskningen som helhet
   * --------------------------------------------------------------- */
  describe('Visa status för granskningen som helhet', () => {
    it('renders overall review status', async () => {
      renderReviewRequirements('1');
      await waitFor(() => {
        const expectedStatuses = [
          {
            sectionId: 'not-assessed-section',
            id: 'not-assessed-count',
            status: Status.NOT_ASSESSED,
            text: i18n.t('Status.notAssessedPlural'),
          },
          {
            sectionId: 'pass-section',
            id: 'pass-count',
            status: Status.PASS,
            text: i18n.t('Status.passPlural'),
          },
          {
            sectionId: 'fail-section',
            id: 'fail-count',
            status: Status.FAIL,
            text: i18n.t('Status.failPlural'),
          },
          {
            sectionId: 'irrelevant-section',
            id: 'irrelevant-count',
            status: Status.IRRELEVANT,
            text: i18n.t('Status.irrelevantPlural'),
          },
        ];

        // Verify each status count and badge pairing
        expectedStatuses.forEach(({ sectionId, id, status, text }) => {
          const count = mockChecks.filter((c) => c.status === status).length;
          const countElement = document.getElementById(id);
          expect(countElement?.textContent).toBe(count.toString());

          // Find the badge in the same section
          const section = document.getElementById(sectionId);
          const badge = section?.querySelector('[data-testid="status-badge"]');
          expect(badge?.textContent).toContain(text);
        });
      });
    });
  });
});
