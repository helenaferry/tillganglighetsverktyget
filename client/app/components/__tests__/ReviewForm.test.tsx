/// <reference types="vite/client" />

import '@testing-library/jest-dom/vitest';

import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrefillRequirementSetting, Requirement, Review } from '../../data/types';
import { ObjectType } from '../../data/types';
import i18n from '../../lang/i18n';
import type { ReviewForm as ReviewFormType } from '../ReviewForm';

// #region MOCKS
/* ---------------------------------------------------------------
 * MOCKS
 * We need to mock various hooks and components to isolate the ReviewForm
 * component for testing. Web components are mocked to simple HTML elements
 * because shadow DOM encapsulation hides their internal structure from
 * testing-library queries.
 * --------------------------------------------------------------- */

// Mock navigate function
const mockNavigate = vi.fn();

// Mock react-router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hooks - will be configured per test
const mockUseRequirements = vi.fn();
const mockUseRequirementContentTypes = vi.fn();
const mockUseRegulatoryFrameworks = vi.fn();
const mockUpsertReview = vi.fn();
const mockPrefillRequirements = vi.fn();
const mockDeleteChecksForReview = vi.fn();
const mockDeleteReview = vi.fn();

vi.mock('../../hooks/useRequirementData', () => ({
  useRequirements: () => mockUseRequirements(),
  useRequirementContentTypes: () => mockUseRequirementContentTypes(),
  useRegulatoryFrameworks: () => mockUseRegulatoryFrameworks(),
}));

vi.mock('../../hooks/useReviewData', () => ({
  useUpsertReview: () => mockUpsertReview(),
  usePrefillRequirements: () => mockPrefillRequirements(),
  useDeleteChecksForReview: () => mockDeleteChecksForReview(),
  useDeleteReview: () => mockDeleteReview(),
}));

// Mock import.meta.env
const originalEnv = import.meta.env;
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_REGULATORY_FRAMEWORK: '',
      VITE_PREFILL_REQUIREMENTS: JSON.stringify([]),
    },
  },
});

// Mock Digi components
vi.mock('@designsystem-se/af-react', async () => {
  const actual = await vi.importActual('@designsystem-se/af-react');
  return {
    ...actual,
    DigiButton: ({
      children,
      onAfOnClick,
      afType,
      ...props
    }: React.PropsWithChildren<{
      onAfOnClick?: () => void;
      afType?: string;
      afVariation?: string;
      afSize?: string;
      afFullWidth?: boolean;
    }>) => (
      <button
        onClick={onAfOnClick}
        type={afType === 'submit' ? 'submit' : 'button'}
        data-testid="digi-button"
        {...props}
      >
        {children}
      </button>
    ),
    DigiDialog: ({
      children,
      afShowDialog,
      afHeading,
      onAfPrimaryButtonClick,
      onAfSecondaryButtonClick,
      onAfOnClose,
      afPrimaryButtonText,
      afSecondaryButtonText,
    }: React.PropsWithChildren<{
      afShowDialog?: boolean;
      afHeading?: string;
      afSize?: string;
      onAfPrimaryButtonClick?: () => void;
      onAfSecondaryButtonClick?: () => void;
      onAfOnClose?: () => void;
      afPrimaryButtonText?: string;
      afSecondaryButtonText?: string;
    }>) =>
      afShowDialog ? (
        <div role="dialog" aria-label={afHeading} data-testid="digi-dialog">
          <h2>{afHeading}</h2>
          {children}
          <button onClick={onAfPrimaryButtonClick} data-testid="dialog-primary-button">
            {afPrimaryButtonText}
          </button>
          <button onClick={onAfSecondaryButtonClick} data-testid="dialog-secondary-button">
            {afSecondaryButtonText}
          </button>
          <button onClick={onAfOnClose} data-testid="dialog-close-button">
            Close
          </button>
        </div>
      ) : null,
    DigiFormFieldset: ({
      children,
      afLegend,
    }: React.PropsWithChildren<{ afForm?: string; afLegend?: string; afName?: string }>) => (
      <fieldset>
        {afLegend && <legend>{afLegend}</legend>}
        {children}
      </fieldset>
    ),
    DigiFormInput: ({
      afId,
      afLabel,
      afLabelDescription,
      afValue,
      onAfOnInput,
      afRequired,
      afValidationText,
      afValidation,
    }: {
      afId?: string;
      afLabel?: string;
      afLabelDescription?: string;
      afValue?: string;
      onAfOnInput?: (e: CustomEvent) => void;
      afRequired?: boolean;
      afValidationText?: string;
      afValidation?: string;
    }) => (
      <div>
        <label htmlFor={afId}>
          {afLabel}
          {afLabelDescription && <span className="description">{afLabelDescription}</span>}
        </label>
        <input
          id={afId}
          defaultValue={afValue}
          required={afRequired}
          data-validation={afValidation}
          onInput={(e) => {
            if (onAfOnInput) {
              onAfOnInput(
                new CustomEvent('input', {
                  detail: { target: e.target },
                }) as any,
              );
            }
          }}
        />
        {afValidation === 'error' && afValidationText && (
          <span className="error">{afValidationText}</span>
        )}
      </div>
    ),
    DigiFormRadiobutton: ({
      afLabel,
      afValue,
      afChecked,
      onAfOnChange,
      afAriaDescribedby,
    }: {
      afLabel?: string;
      afValue?: string;
      afChecked?: boolean;
      onAfOnChange?: () => void;
      afAriaDescribedby?: string;
    }) => (
      <label>
        <input
          type="radio"
          value={afValue}
          checked={afChecked}
          onChange={onAfOnChange}
          aria-describedby={afAriaDescribedby}
        />
        {afLabel}
      </label>
    ),
    DigiFormRadiogroup: ({
      children,
      onAfOnGroupChange,
      afName,
    }: React.PropsWithChildren<{
      afName?: string;
      onAfOnGroupChange?: (e: Event) => void;
    }>) => (
      <div
        role="radiogroup"
        data-name={afName}
        onChange={(e) => {
          if (onAfOnGroupChange) {
            onAfOnGroupChange(e as any);
          }
        }}
      >
        {children}
      </div>
    ),
    DigiFormValidationMessage: ({
      children,
      afVariation,
    }: React.PropsWithChildren<{ afVariation?: string }>) => (
      <div data-testid="validation-message" data-variation={afVariation}>
        {children}
      </div>
    ),
    DigiIconTrash: () => <span data-testid="trash-icon">🗑</span>,
    DigiLoaderSkeleton: ({ afCount }: { afVariation?: string; afCount?: number }) => (
      <div data-testid="loader-skeleton" data-count={afCount}>
        Loading...
      </div>
    ),
    DigiLoaderSpinner: ({ afText }: { afSize?: string; afText?: string }) => (
      <div data-testid="loader-spinner">{afText}</div>
    ),
    DigiNotificationAlert: ({
      children,
      afHeading,
    }: React.PropsWithChildren<{
      afSize?: string;
      afVariation?: string;
      afHeading?: string;
    }>) => (
      <div data-testid="notification-alert" role="alert">
        {afHeading && <h3>{afHeading}</h3>}
        {children}
      </div>
    ),
  };
});

// #endregion MOCKS

// #region MOCK DATA
/* ---------------------------------------------------------------
 * MOCK DATA
 * Sample data to use in tests
 * --------------------------------------------------------------- */

const mockRequirements: Requirement[] = [
  {
    id: '1.1.1',
    name: 'Lorem ipsum dolor',
    regulatoryFramework: 'dos',
    wcag: '1.1.1',
    en301549: '9.1.1.1',
    contentType: 'images',
    category: 'Consectetur',
    objectType: ObjectType.WEB,
    statement: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    why: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    howToTest: 'Ut enim ad minim veniam quis nostrud exercitation',
  },
  {
    id: '1.2.1',
    name: 'Adipiscing elit sed',
    regulatoryFramework: 'dos',
    wcag: '1.2.1',
    en301549: '9.1.2.1',
    contentType: 'video',
    category: 'Consectetur',
    objectType: ObjectType.WEB,
    statement: 'Duis aute irure dolor in reprehenderit',
    why: 'Voluptate velit esse cillum dolore',
    howToTest: 'Excepteur sint occaecat cupidatat',
  },
  {
    id: '1.3.1',
    name: 'Tempor incididunt',
    regulatoryFramework: 'dos',
    wcag: '1.3.1',
    en301549: '9.1.3.1',
    contentType: 'general',
    category: 'Consectetur',
    objectType: ObjectType.WEB,
    statement: 'Ullamco laboris nisi ut aliquip ex ea commodo consequat',
    why: 'Duis aute irure dolor in reprehenderit in voluptate',
    howToTest: 'Velit esse cillum dolore eu fugiat nulla pariatur',
  },
];

const mockContentTypes = ['images', 'video', 'general'];

const mockRegulatoryFrameworks = ['dos', 'lptt'];

const mockReview: Review = {
  id: 1,
  title: 'Test Review',
  excludedContentTypes: 'video',
  selectedPrefillIds: '1',
  objectType: ObjectType.WEB,
  regulatoryFramework: 'dos',
  created_at: '2024-01-01',
};

const mockPrefillSettings: PrefillRequirementSetting[] = [
  {
    id: '1',
    automatic: 'false',
    heading: 'Test Prefill',
    description: 'This is a test prefill setting',
    activateText: 'Activate this prefill?',
    prefillRequirements: [
      {
        status: 'IRRELEVANT',
        ids: ['1.1.1'],
        comment: 'Test comment',
      },
    ],
  },
  {
    id: '2',
    automatic: 'true',
    heading: 'Automatic Prefill',
    description: 'This prefill is automatic',
    activateText: '',
    prefillRequirements: [
      {
        status: 'PASS',
        ids: ['1.2.1'],
        comment: 'Automatic pass',
      },
    ],
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

// Helper to create mutation result
function createMutationResult(overrides = {}): UseMutationResult<any, Error, any, unknown> {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isIdle: true,
    isPending: false,
    isError: false,
    isSuccess: false,
    status: 'idle',
    error: null,
    data: undefined,
    reset: vi.fn(),
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    variables: undefined,
    submittedAt: 0,
    context: undefined,
    ...overrides,
  } as UseMutationResult<any, Error, any, unknown>;
}

// #endregion MOCK DATA

// #region HELPER FUNCTIONS
/* ---------------------------------------------------------------
 * HELPER FUNCTIONS
 * Helper functions to render the component with default props
 * --------------------------------------------------------------- */

async function renderReviewForm(review?: Review) {
  const { ReviewForm } = await import('../ReviewForm');
  return render(
    <BrowserRouter>
      <ReviewForm review={review} />
    </BrowserRouter>,
  );
}

function setupDefaultMocks() {
  mockUseRequirements.mockReturnValue(createQueryResult(mockRequirements));
  mockUseRequirementContentTypes.mockReturnValue(createQueryResult(mockContentTypes));
  mockUseRegulatoryFrameworks.mockReturnValue(createQueryResult(mockRegulatoryFrameworks));
  mockUpsertReview.mockReturnValue(createMutationResult());
  mockPrefillRequirements.mockReturnValue(createMutationResult());
  mockDeleteChecksForReview.mockReturnValue(createMutationResult());
  mockDeleteReview.mockReturnValue(createMutationResult());
}

// #endregion HELPER FUNCTIONS

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    setupDefaultMocks();
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Välja tillämpliga lagkrav
   * --------------------------------------------------------------- */
  describe('Välja tillämpliga lagkrav', () => {
    it('shows regulatory framework section when env variable is not set', async () => {
      // Clear the env variable for this test
      vi.stubEnv('VITE_REGULATORY_FRAMEWORK', '');

      await renderReviewForm();

      // When env variable is empty, the regulatory framework section should be visible
      expect(
        screen.getByText(i18n.t('ReviewForm.RegulatoryFramework.Question')),
      ).toBeInTheDocument();

      // Should show a fieldset containing the regulatory framework options
      const legendElement = screen.getByText(i18n.t('ReviewForm.RegulatoryFramework.Question'));
      const fieldset = legendElement.closest('fieldset');
      expect(fieldset).toBeInTheDocument();
    });

    it('hides regulatory framework section when env variable is set', async () => {
      // Set VITE_REGULATORY_FRAMEWORK to 'dos'
      vi.stubEnv('VITE_REGULATORY_FRAMEWORK', 'dos');

      await renderReviewForm();

      // When env variable is set, the regulatory framework section should be hidden
      expect(
        screen.queryByText(i18n.t('ReviewForm.RegulatoryFramework.Question')),
      ).not.toBeInTheDocument();
    });

    it('uses preselected regulatory framework value from env variable', async () => {
      const mutateMock = vi.fn();
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      // Set VITE_REGULATORY_FRAMEWORK to 'dos'
      vi.stubEnv('VITE_REGULATORY_FRAMEWORK', 'dos');

      const { container } = await renderReviewForm();

      // Fill in the name field using userEvent
      const nameInput = container.querySelector('#reviewName') as HTMLInputElement;
      await userEvent.type(nameInput, 'Test Review');

      // Submit the form
      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        // The regulatory framework should be 'dos' from env variable
        // even though the section is not shown in the UI
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Review',
            regulatoryFramework: 'dos',
          }),
          expect.any(Object),
        );
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Ange namn på granskningen
   * --------------------------------------------------------------- */
  describe('Ange namn på granskningen', () => {
    it('sets review name from user input', async () => {
      const mutateMock = vi.fn();
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      const { container } = await renderReviewForm();

      // Fill in the name field using userEvent
      const nameInput = container.querySelector('#reviewName') as HTMLInputElement;
      await userEvent.type(nameInput, 'Test Review');

      // Submit the form
      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Review',
            regulatoryFramework: 'dos',
            objectType: ObjectType.WEB,
            excludedContentTypes: [],
          }),
          expect.any(Object),
        );
      });
    });

    it('prevents submission and shows error if name is empty', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn();
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm();

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(i18n.t('ReviewForm.ReviewName.Validation'))).toBeInTheDocument();
      });

      expect(mutateMock).not.toHaveBeenCalled();
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Besvara frågor om vad tjänsten innehåller
   * --------------------------------------------------------------- */
  describe('Besvara frågor om vad tjänsten innehåller', () => {
    it('shows radiobuttons for each content type', async () => {
      await renderReviewForm();

      expect(screen.getByText(i18n.t('ReviewForm.ContentTypes.Question'))).toBeInTheDocument();

      const fieldsets = screen.getAllByRole('group');
      expect(fieldsets).toHaveLength(mockContentTypes.length);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(mockContentTypes.length * 2);
    });

    it('lets user change content type from Yes to No', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn();
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm();

      const radioButtons = screen.getAllByRole('radio');
      const imagesNoButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('images') &&
          btn.getAttribute('value') === 'false'
        );
      });

      expect(imagesNoButton).not.toBeChecked();
      await user.click(imagesNoButton!);
      expect(imagesNoButton).toBeChecked();

      // Submit the form
      const nameInput = screen.getByLabelText(new RegExp(i18n.t('ReviewForm.ReviewName.Label')));
      await user.type(nameInput, 'Test Review');

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Review',
            excludedContentTypes: expect.arrayContaining(['images']),
            regulatoryFramework: expect.any(String),
            objectType: ObjectType.WEB,
          }),
          expect.any(Object),
        );
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Anpassa kravmängden baserat på angivna svar
   * --------------------------------------------------------------- */
  describe('Anpassa kravmängden baserat på angivna svar', () => {
    it('shows number of requirements based on replies', async () => {
      await renderReviewForm();

      const statusText = screen.getByRole('status');
      expect(statusText).toHaveTextContent(
        `3 ${i18n.t('of')} 3 ${i18n.t('ReviewForm.RequirementsToReview')}`,
      );
    });

    it('decreases number of requirements when content type is excluded', async () => {
      await renderReviewForm(mockReview);

      const statusText = screen.getByRole('status');
      expect(statusText.textContent).toMatch(/^2/);
    });

    it('updates requirement count when user changes content type', async () => {
      const user = userEvent.setup();
      await renderReviewForm();

      const initialStatus = screen.getByRole('status');
      expect(initialStatus).toHaveTextContent('3');

      const radioButtons = screen.getAllByRole('radio');
      const videoNoButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('video') &&
          btn.getAttribute('value') === 'false'
        );
      });

      await user.click(videoNoButton!);

      await waitFor(() => {
        const updatedStatus = screen.getByRole('status');
        expect(updatedStatus).toHaveTextContent('2');
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Skapa och spara granskningen
   * --------------------------------------------------------------- */
  describe('Skapa och spara granskningen', () => {
    it('shows create button for new review', async () => {
      await renderReviewForm();
      expect(
        screen.getByRole('button', { name: i18n.t('ReviewForm.CreateButtonText') }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: new RegExp(i18n.t('ReviewForm.DeleteButtonText')) }),
      ).not.toBeInTheDocument();
    });
    it('creates a review from start to finish', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn((_data, options) => {
        options.onSuccess({ id: 42 });
      });
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm();

      const nameInput = screen.getByLabelText(new RegExp(i18n.t('ReviewForm.ReviewName.Label')));
      await user.type(nameInput, 'Min tillgänglighetsgranskning');

      const radioButtons = screen.getAllByRole('radio');
      const videoNoButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('video') &&
          btn.getAttribute('value') === 'false'
        );
      });
      await user.click(videoNoButton!);

      await waitFor(() => {
        const status = screen.getByRole('status');
        expect(status).toHaveTextContent('2');
      });

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Min tillgänglighetsgranskning',
            excludedContentTypes: expect.arrayContaining(['video']),
            regulatoryFramework: expect.any(String),
            objectType: ObjectType.WEB,
          }),
          expect.any(Object),
        );
        expect(mutateMock).toHaveBeenCalledTimes(1);
      });
    });

    it('shows loading indicator while saving', async () => {
      const user = userEvent.setup();
      const deferred = { resolveOnSuccess: null as ((value: any) => void) | null };
      const mutateMock = vi.fn((_data, options) => {
        // Simulate async operation - don't call onSuccess immediately
        deferred.resolveOnSuccess = () => options.onSuccess({ id: 1 });
      });
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm();

      const input = document.getElementById('reviewName') as HTMLInputElement;
      await user.type(input, 'Test');

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('loader-spinner')).toBeInTheDocument();
        expect(screen.getByText(i18n.t('ReviewForm.Saving'))).toBeInTheDocument();
      });

      // Resolve the async operation
      if (deferred.resolveOnSuccess) {
        deferred.resolveOnSuccess(undefined);
        // Wait for the loading indicator to disappear
        await waitFor(() => {
          expect(screen.queryByTestId('loader-spinner')).not.toBeInTheDocument();
        });
      }
    });

    it('shows error message and stays on page when submission fails', async () => {
      const user = userEvent.setup();
      mockUpsertReview.mockReturnValue(createMutationResult({ isError: true }));

      await renderReviewForm();

      const input = screen.getByLabelText(new RegExp(i18n.t('ReviewForm.ReviewName.Label')));
      await user.type(input, 'Test');

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CreateButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(i18n.t('ReviewForm.SaveErrorHeading'))).toBeInTheDocument();
        expect(screen.getByText(i18n.t('ReviewForm.SaveErrorText'))).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: i18n.t('ReviewForm.CreateButtonText') }),
      ).toBeInTheDocument();
    });

    it('cancels review creation', async () => {
      const user = userEvent.setup();
      await renderReviewForm();

      const nameInput = screen.getByLabelText(new RegExp(i18n.t('ReviewForm.ReviewName.Label')));
      await user.type(nameInput, 'Test');

      const cancelButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.CancelButtonText'),
      });
      await user.click(cancelButton);

      expect(
        screen.getByRole('dialog', { name: i18n.t('ReviewForm.Abort.ConfirmHeading') }),
      ).toBeInTheDocument();

      const yesButton = screen.getByTestId('dialog-primary-button');
      await user.click(yesButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Ändra namn på granskningen
   * --------------------------------------------------------------- */
  describe('Ändra namn på granskningen', () => {
    it('fills in existing name when editing', async () => {
      await renderReviewForm(mockReview);
      const input = screen.getByDisplayValue(mockReview.title as string);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(mockReview.title);
    });

    it('submits updated name when editing', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn((_data, options) => {
        options.onSuccess({ id: 1 });
      });
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm(mockReview);

      const input = screen.getByDisplayValue(mockReview.title as string);
      await user.clear(input);
      await user.type(input, 'Updated Review Name');

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.SaveButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            title: 'Updated Review Name',
            regulatoryFramework: 'dos',
            objectType: ObjectType.WEB,
            excludedContentTypes: ['video'],
            selectedPrefillIds: '1',
          }),
          expect.any(Object),
        );
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Ändra uppgifter om om vad tjänsten innehåller
   * --------------------------------------------------------------- */
  describe('Ändra uppgifter om vad tjänsten innehåller', () => {
    it('marks excluded content types as "No"', async () => {
      await renderReviewForm(mockReview);

      // Video should be excluded (checked = "Nej")
      const radioButtons = screen.getAllByRole('radio');
      const videoNoButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === 'false' && (btn as HTMLInputElement).checked,
      );
      expect(videoNoButton).toBeInTheDocument();
    });

    it('shows warning when changing content type for existing review (Yes to No)', async () => {
      const user = userEvent.setup();
      await renderReviewForm(mockReview);

      // Change images from yes to no
      const radioButtons = screen.getAllByRole('radio');
      const imagesNoButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('images') &&
          btn.getAttribute('value') === 'false'
        );
      });

      expect(imagesNoButton).toBeDefined();
      if (imagesNoButton) {
        await user.click(imagesNoButton);

        await waitFor(() => {
          expect(
            screen.getByText(i18n.t('ReviewForm.ContentTypes.ContentChangeWarningNo')),
          ).toBeInTheDocument();
        });
      }
    });

    it('shows warning when changing content type for existing review (No to Yes)', async () => {
      const user = userEvent.setup();
      await renderReviewForm(mockReview);

      // Change video from no to yes
      const radioButtons = screen.getAllByRole('radio');
      const videoYesButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('video') &&
          btn.getAttribute('value') === 'true'
        );
      });

      expect(videoYesButton).toBeDefined();
      if (videoYesButton) {
        await user.click(videoYesButton);

        await waitFor(() => {
          expect(
            screen.getByText(i18n.t('ReviewForm.ContentTypes.ContentChangeWarningYes')),
          ).toBeInTheDocument();
        });
      }
    });

    it('saves updated content types when editing (No to Yes)', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn((_data, options) => {
        options.onSuccess({ id: 1 });
      });
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm(mockReview);

      // Change video from no to yes
      const radioButtons = screen.getAllByRole('radio');
      const videoYesButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('video') &&
          btn.getAttribute('value') === 'true'
        );
      });

      await user.click(videoYesButton!);

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.SaveButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            title: mockReview.title,
            excludedContentTypes: [],
            regulatoryFramework: 'dos',
            objectType: ObjectType.WEB,
            selectedPrefillIds: '1',
          }),
          expect.any(Object),
        );
      });
    });

    it('saves updated content types when editing (Yes to No)', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn((_data, options) => {
        options.onSuccess({ id: 1 });
      });
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm(mockReview);

      // Change images from yes to no
      const radioButtons = screen.getAllByRole('radio');
      const imagesNoButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('images') &&
          btn.getAttribute('value') === 'false'
        );
      });

      await user.click(imagesNoButton!);

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.SaveButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            title: mockReview.title,
            excludedContentTypes: expect.arrayContaining(['video', 'images']),
            regulatoryFramework: 'dos',
            objectType: ObjectType.WEB,
            selectedPrefillIds: '1',
          }),
          expect.any(Object),
        );
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Spara uppdaterade uppgifter
   * --------------------------------------------------------------- */
  describe('Spara uppdaterade uppgifter', () => {
    it('shows save and delete buttons for existing review', async () => {
      await renderReviewForm(mockReview);
      expect(
        screen.getByRole('button', { name: i18n.t('ReviewForm.SaveButtonText') }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: new RegExp(i18n.t('ReviewForm.DeleteButtonText')) }),
      ).toBeInTheDocument();
    });

    it('edits existing review and changes content types', async () => {
      const user = userEvent.setup();
      const mutateMock = vi.fn((_data, options) => {
        options.onSuccess({ id: 1 });
      });
      mockUpsertReview.mockReturnValue(createMutationResult({ mutate: mutateMock }));

      await renderReviewForm(mockReview);

      const radioButtons = screen.getAllByRole('radio');
      const videoYesButton = radioButtons.find((btn) => {
        const parent = btn.closest('[role="radiogroup"]');
        return (
          parent?.getAttribute('data-name')?.includes('video') &&
          btn.getAttribute('value') === 'true'
        );
      });

      await user.click(videoYesButton!);
      expect(
        screen.getByText(i18n.t('ReviewForm.ContentTypes.ContentChangeWarningYes')),
      ).toBeInTheDocument();

      const submitButton = screen.getByRole('button', {
        name: i18n.t('ReviewForm.SaveButtonText'),
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalled();
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Radera granskningen efter bekräftelse
   * --------------------------------------------------------------- */
  describe('Radera granskningen efter bekräftelse', () => {
    it('deletes review after confirmation', async () => {
      const user = userEvent.setup();
      const deleteMutateMock = vi.fn((_id, options) => {
        options.onSuccess();
      });
      mockDeleteReview.mockReturnValue(createMutationResult({ mutate: deleteMutateMock }));

      await renderReviewForm(mockReview);

      const deleteButton = screen.getByRole('button', {
        name: new RegExp(i18n.t('ReviewForm.DeleteButtonText')),
      });
      await user.click(deleteButton);

      const dialog = await screen.findByRole('dialog', {
        name: i18n.t('ReviewForm.Delete.ConfirmHeading'),
      });
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(mockReview.title as string)).toBeInTheDocument();

      const yesButton = screen.getByTestId('dialog-primary-button');
      await user.click(yesButton);

      await waitFor(() => {
        expect(deleteMutateMock).toHaveBeenCalledWith(1, expect.any(Object));
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('does not delete review if user cancels', async () => {
      const user = userEvent.setup();
      const deleteMock = vi.fn();
      mockDeleteReview.mockReturnValue(createMutationResult({ mutate: deleteMock }));

      await renderReviewForm(mockReview);

      const deleteButton = screen.getByRole('button', {
        name: new RegExp(i18n.t('ReviewForm.DeleteButtonText')),
      });
      await user.click(deleteButton);

      const dialog = screen.getByRole('dialog', {
        name: i18n.t('ReviewForm.Delete.ConfirmHeading'),
      });
      expect(dialog).toBeInTheDocument();

      const noButton = screen.getByTestId('dialog-secondary-button');
      await user.click(noButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(deleteMock).not.toHaveBeenCalled();
    });
  });
});
