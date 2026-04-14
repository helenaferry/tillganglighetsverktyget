import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Status } from '../../data/types';
import i18n from '../../lang/i18n';
import RequirementForm from '../RequirementForm';

// Mock data hooks - will be configured per test
const mockUseCheck = vi.fn();
const mockUpsertCheck = vi.fn();
const mockDeleteCheck = vi.fn();

vi.mock('~/hooks/useReviewData', () => ({
  useCheck: () => mockUseCheck(),
  useUpsertCheck: () => mockUpsertCheck(),
  useDeleteCheck: () => mockDeleteCheck(),
}));

// Store current radiogroup handler for connecting buttons to groups in tests
let currentOnGroupChange: ((e: CustomEvent<{ target: { value: string } }>) => void) | null = null;

// Mock design system components
vi.mock('@designsystem-se/af-react', () => ({
  DigiButton: ({
    children,
    onAfOnClick,
    afType,
    afAriaLabel,
    ...props
  }: {
    children?: React.ReactNode;
    onAfOnClick?: () => void;
    afType?: string;
    afAriaLabel?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onAfOnClick}
      type={afType === 'submit' ? 'submit' : 'button'}
      aria-label={afAriaLabel}
      data-testid="digi-button"
      {...props}
    >
      {children}
    </button>
  ),
  DigiFormRadiobutton: ({
    afLabel,
    afValue,
    afChecked,
    afAriaDescribedby,
    value,
  }: {
    afLabel?: string;
    afValue?: string | number;
    afChecked?: boolean;
    afAriaDescribedby?: string;
    value?: string | number;
  }) => {
    const radioValue = value !== undefined ? value : afValue;
    return (
      <label>
        <input
          type="radio"
          name="fulfillment"
          value={radioValue}
          checked={afChecked}
          aria-describedby={afAriaDescribedby}
          onClick={() => {
            if (currentOnGroupChange) {
              const customEvent = new CustomEvent('change', {
                detail: String(radioValue),
              }) as CustomEvent<string>;
              currentOnGroupChange(customEvent);
            }
          }}
          onChange={() => {}}
        />
        {afLabel}
      </label>
    );
  },
  DigiFormRadiogroup: ({
    children,
    onAfOnGroupChange,
    afName,
  }: {
    children?: React.ReactNode;
    onAfOnGroupChange?: (e: CustomEvent<string>) => void;
    afName?: string;
  }) => {
    currentOnGroupChange = onAfOnGroupChange ?? null;
    return (
      <div role="radiogroup" data-name={afName}>
        {children}
      </div>
    );
  },
  DigiExpandableAccordion: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="expandable-accordion">{children}</div>
  ),
  DigiFormFieldset: ({ children, afLegend }: { children?: React.ReactNode; afLegend?: string }) => (
    <fieldset>
      {afLegend && <legend>{afLegend}</legend>}
      {children}
    </fieldset>
  ),
  DigiFormTextarea: ({
    afValue,
    onAfOnInput,
    onBlur,
    ...props
  }: {
    afValue?: string;
    onAfOnInput?: (e: CustomEvent<{ target: { value: string } }>) => void;
    onBlur?: () => void;
    [key: string]: unknown;
  }) => (
    <textarea
      value={afValue}
      onChange={(e) => {
        if (onAfOnInput) {
          const customEvent = new CustomEvent('input', {
            detail: { target: { value: e.target.value } },
          }) as CustomEvent<{ target: { value: string } }>;
          onAfOnInput(customEvent);
        }
      }}
      onBlur={onBlur}
      {...props}
    />
  ),
  DigiIconCopy: () => <span data-testid="copy-icon">Copy</span>,
  DigiInfoCard: ({ children, afHeading }: { children?: React.ReactNode; afHeading?: string }) => (
    <div data-testid="info-card">
      {afHeading && <h3>{afHeading}</h3>}
      {children}
    </div>
  ),
}));

describe('RequirementForm', () => {
  const mockCheckId = 'check-1';
  const mockRequirementId = 'requirement-1';
  const mockReviewId = 'review-1';
  const mockTextSuggestions: string[] = [];

  const renderRequirementForm = (textSuggestions: string[] = mockTextSuggestions) =>
    render(
      <BrowserRouter>
        <RequirementForm
          requirementId={mockRequirementId}
          reviewId={mockReviewId}
          textSuggestions={textSuggestions}
        />
      </BrowserRouter>,
    );

  const mockCheck = {
    id: mockCheckId,
    requirement: mockRequirementId,
    status: Status.NOT_ASSESSED,
    flag: false,
    comment: '',
  };

  const mockUpsert = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCheck.mockReturnValue({
      check: mockCheck,
      isLoading: false,
    });

    mockUpsertCheck.mockReturnValue({
      mutate: mockUpsert,
      isPending: false,
    });

    mockDeleteCheck.mockReturnValue({
      mutate: mockDelete,
      isPending: false,
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra bedömning av krav
   * --------------------------------------------------------------- */
  describe('Möjliggöra bedömning av krav', () => {
    it('renders all assessment status radio buttons', async () => {
      renderRequirementForm();

      await waitFor(() => {
        const radioButtons = screen.getAllByRole('radio');
        // Should have 4 radio buttons with Status enum values
        expect(radioButtons.length).toBe(4);

        const values = radioButtons.map((btn) => btn.getAttribute('value'));
        expect(values).toContain(String(Status.NOT_ASSESSED));
        expect(values).toContain(String(Status.PASS));
        expect(values).toContain(String(Status.FAIL));
        expect(values).toContain(String(Status.IRRELEVANT));
      });
    });

    it('marks requirement as pass', async () => {
      const user = userEvent.setup();

      renderRequirementForm();

      const radioButtons = await screen.findAllByRole('radio');
      const passButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === String(Status.PASS),
      );
      await user.click(passButton!);

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            status: Status.PASS,
          }),
          expect.any(Object),
        );
      });
    });

    it('marks requirement as fail', async () => {
      const user = userEvent.setup();

      renderRequirementForm();

      const radioButtons = await screen.findAllByRole('radio');
      const failButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === String(Status.FAIL),
      );
      await user.click(failButton!);

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            status: Status.FAIL,
          }),
          expect.any(Object),
        );
      });
    });

    it('marks requirement as irrelevant', async () => {
      const user = userEvent.setup();

      renderRequirementForm();

      const radioButtons = await screen.findAllByRole('radio');
      const irrelevantButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === String(Status.IRRELEVANT),
      );
      await user.click(irrelevantButton!);

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            status: Status.IRRELEVANT,
          }),
          expect.any(Object),
        );
      });
    });

    it('marks requirement as not assessed', async () => {
      const user = userEvent.setup();

      renderRequirementForm();

      const radioButtons = await screen.findAllByRole('radio');
      const passButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === String(Status.PASS),
      );
      const notAssessedButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === String(Status.NOT_ASSESSED),
      );

      // First set to PASS, then click NOT_ASSESSED to test the change
      await user.click(passButton!);
      await user.click(notAssessedButton!);

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenLastCalledWith(
          expect.objectContaining({
            status: Status.NOT_ASSESSED,
          }),
          expect.any(Object),
        );
      });
    });

    it('reflects current check status on load', async () => {
      mockUseCheck.mockReturnValue({
        check: { ...mockCheck, status: Status.PASS },
        isLoading: false,
      });

      renderRequirementForm();

      const radioButtons = await screen.findAllByRole('radio');
      const passButton = radioButtons.find(
        (btn) => btn.getAttribute('value') === String(Status.PASS),
      );
      expect(passButton).toBeChecked();
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra motivering text av bedömning
   * i ett textfält
   * --------------------------------------------------------------- */
  describe('Möjliggöra motivering text av bedömning i ett textfält', () => {
    it('saves textarea comment on blur', async () => {
      const user = userEvent.setup();
      renderRequirementForm();

      const textarea = await screen.findByRole('textbox');
      await user.type(textarea, 'This is a comment');
      await textarea.blur();

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            comment: 'This is a comment',
          }),
          expect.any(Object),
        );
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Visa förslag till texter som stöd vid
   * formulering av tillgänglighetsredogörelser
   * --------------------------------------------------------------- */
  describe('Visa förslag till texter som stöd vid formulering av tillgänglighetsredogörelser', () => {
    it('copies text suggestion to comment when copy button is clicked', async () => {
      const user = userEvent.setup();
      const suggestion = 'Suggested comment';
      renderRequirementForm([suggestion]);

      // Find the copy button by its aria-label which contains the suggestion text
      const expectedAriaLabel = i18n.t('RequirementForm.CopyTextAriaDescription', {
        text: suggestion,
      });
      const buttons = await screen.findAllByRole('button');
      const copyButton = buttons.find(
        (btn) => btn.getAttribute('aria-label') === expectedAriaLabel,
      );

      if (!copyButton) {
        throw new Error(`Copy button with aria-label "${expectedAriaLabel}" not found`);
      }

      await user.click(copyButton);

      // Verify textarea now contains the suggestion
      const textarea = await screen.findByRole('textbox');
      expect(textarea).toHaveValue(suggestion);

      // Blur saves it
      await textarea.blur();

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            comment: suggestion,
          }),
          expect.any(Object),
        );
      });
    });
  });
});
