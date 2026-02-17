import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import i18n from '../../lang/i18n';
import { Status } from '../../data/types';
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
let currentOnGroupChange: any = null;

// Mock design system components
vi.mock('@designsystem-se/af-react', () => ({
  DigiButton: ({ children, onAfOnClick, afType, ...props }: any) => (
    <button
      onClick={onAfOnClick}
      type={afType === 'submit' ? 'submit' : 'button'}
      data-testid="digi-button"
      {...props}
    >
      {children}
    </button>
  ),
  DigiFormRadiobutton: ({ afLabel, afValue, afChecked, afAriaDescribedby, value }: any) => {
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
              const target = { value: String(radioValue) } as any;
              const customEvent = new CustomEvent('change', {
                detail: { target },
              }) as any;
              currentOnGroupChange(customEvent);
            }
          }}
          onChange={() => {}}
        />
        {afLabel}
      </label>
    );
  },
  DigiFormRadiogroup: ({ children, onAfOnGroupChange, afName }: any) => {
    currentOnGroupChange = onAfOnGroupChange;
    return (
      <div role="radiogroup" data-name={afName}>
        {children}
      </div>
    );
  },
  DigiExpandableAccordion: ({ children }: any) => (
    <div data-testid="expandable-accordion">{children}</div>
  ),
  DigiFormFieldset: ({ children, afLegend }: any) => (
    <fieldset>
      {afLegend && <legend>{afLegend}</legend>}
      {children}
    </fieldset>
  ),
  DigiFormTextarea: ({ afValue, onAfOnChange, ...props }: any) => (
    <textarea value={afValue} onChange={onAfOnChange} {...props} />
  ),
  DigiIconCopy: () => <span data-testid="copy-icon">Copy</span>,
  DigiInfoCard: ({ children, afHeading }: any) => (
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

  const renderRequirementForm = () =>
    render(
      <BrowserRouter>
        <RequirementForm
          requirementId={mockRequirementId}
          reviewId={mockReviewId}
          textSuggestions={mockTextSuggestions}
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
});
