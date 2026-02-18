import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import i18n from '../../lang/i18n';
import { CardsOrTable } from '../CardsOrTable';

// Global tracker for DigiContextMenu callback invocations
export const contextMenuCallbacks: Array<{ item: { id: number; title: string } }> = [];

// Mock web components to use regular HTML elements for testing
// Web components don't work properly in happy-dom environment used by vitest
vi.mock('@designsystem-se/af-react', async () => {
  const actual = await vi.importActual('@designsystem-se/af-react');
  return {
    ...actual,
    DigiButton: ({
      children,
      onAfOnClick,
      ...props
    }: React.PropsWithChildren<{ onAfOnClick?: () => void }>) => (
      <button onClick={onAfOnClick} data-testid="digi-button" {...props}>
        {children}
      </button>
    ),
    DigiContextMenu: ({
      afId,
      afTitle,
      afMenuItems,
      onAfChangeItem,
      ...props
    }: {
      afId?: string;
      afTitle?: string;
      afMenuPosition?: string;
      afMenuItems?: Array<{ id: number; title: string }>;
      onAfChangeItem?: (e: CustomEvent<{ item: { id: number; title: string } }>) => void;
    }) => {
      return (
        <div id={afId} data-title={afTitle} {...props}>
          {afMenuItems?.map((item) => (
            <button
              key={item.id}
              data-testid={`menu-item-${item.id}`}
              onClick={() => {
                if (onAfChangeItem) {
                  // Track the callback invocation
                  contextMenuCallbacks.push({ item });
                  onAfChangeItem(new CustomEvent('changeItem', { detail: { item } }));
                }
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      );
    },
    DigiFormFilter: ({
      afFilterButtonText,
      afSubmitButtonText,
      afListItems,
      ...props
    }: {
      afFilterButtonText?: string;
      afSubmitButtonText?: string;
      afListItems?: unknown;
    }) => (
      <div
        data-testid="digi-form-filter"
        data-filter-button-text={afFilterButtonText}
        data-submit-button-text={afSubmitButtonText}
        data-list-items={JSON.stringify(afListItems)}
        {...props}
      />
    ),
    DigiFormInputSearch: ({
      afLabel,
      afValue,
      onAfOnSubmitSearch,
      ...props
    }: {
      afLabel?: string;
      afValue?: string;
      onAfOnSubmitSearch?: (e: CustomEvent<string>) => void;
    }) => (
      <input
        data-testid="digi-form-input-search"
        data-label={afLabel}
        defaultValue={afValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onAfOnSubmitSearch) {
            onAfOnSubmitSearch(
              new CustomEvent('submit', { detail: (e.target as HTMLInputElement).value }),
            );
          }
        }}
        {...props}
      />
    ),
    DigiNavigationPagination: ({
      afTotalPages,
      afInitActivePage,
      afCurrentResultStart,
      afCurrentResultEnd,
      afTotalResults,
      onAfOnPageChange,
      ...props
    }: {
      afTotalPages?: number;
      afInitActivePage?: number;
      afCurrentResultStart?: number;
      afCurrentResultEnd?: number;
      afTotalResults?: number;
      onAfOnPageChange?: (e: CustomEvent<number>) => void;
    }) => (
      <div
        data-testid="digi-navigation-pagination"
        data-total-pages={afTotalPages}
        data-active-page={afInitActivePage}
        data-result-start={afCurrentResultStart}
        data-result-end={afCurrentResultEnd}
        data-total-results={afTotalResults}
        {...props}
      >
        <div data-testid="pagination-info">
          {afCurrentResultStart}-{afCurrentResultEnd} av {afTotalResults}
        </div>
        <button
          data-testid="pagination-prev"
          disabled={afInitActivePage === 1}
          onClick={() => {
            if (onAfOnPageChange && afInitActivePage && afInitActivePage > 1) {
              onAfOnPageChange(new CustomEvent('pageChange', { detail: afInitActivePage - 1 }));
            }
          }}
        >
          Föregående
        </button>
        {Array.from({ length: afTotalPages || 0 }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            data-testid={`pagination-page-${page}`}
            aria-current={page === afInitActivePage ? 'page' : undefined}
            onClick={() => {
              if (onAfOnPageChange) {
                onAfOnPageChange(new CustomEvent('pageChange', { detail: page }));
              }
            }}
          >
            {page}
          </button>
        ))}
        <button
          data-testid="pagination-next"
          disabled={afInitActivePage === afTotalPages}
          onClick={() => {
            if (
              onAfOnPageChange &&
              afInitActivePage &&
              afTotalPages &&
              afInitActivePage < afTotalPages
            ) {
              onAfOnPageChange(new CustomEvent('pageChange', { detail: afInitActivePage + 1 }));
            }
          }}
        >
          Nästa
        </button>
      </div>
    ),
  };
});

const mockRows = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  posInSet: i + 1,
  content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
}));

const mockHeadings = ['Heading 1', 'Heading 2'];

// Helper to render with default props
const renderCardsOrTable = (props: Partial<React.ComponentProps<typeof CardsOrTable>> = {}) => {
  const rows = props.rows ?? mockRows;
  const totalItems = props.totalItems ?? rows.length;

  return render(
    <CardsOrTable
      headings={mockHeadings}
      rows={rows}
      itemsName="objekt"
      totalItems={totalItems}
      {...props}
    />,
  );
};

describe('CardsOrTable', () => {
  /* ---------------------------------------------------------------
   * Rendering and basic interactions
   * --------------------------------------------------------------- */
  describe('Rendering and basic interactions', () => {
    it('shows singular text when only one row', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={[mockRows[0]]}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={1}
        />,
      );
      expect(container.textContent).toContain('1 granskning');
    });

    it('shows plural text when multiple rows', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
        />,
      );
      expect(container.textContent).toContain(`${mockRows.length} granskningar`);
    });

    it('handles empty rows array without errors', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={[]}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={0}
        />,
      );
      expect(container.textContent).toContain('0 granskningar');
    });

    it('shows found text when filtered results are less than total', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={[mockRows[0]]}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={10}
        />,
      );
      expect(container.textContent).toContain(i18n.t('CardsOrTable.Found'));
    });

    it('renders table with correct headings', () => {
      const { container } = renderCardsOrTable({ itemsName: 'granskningar' });
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();

      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(2);
      expect(headers[0]).toHaveTextContent(mockHeadings[0]);
      expect(headers[1]).toHaveTextContent(mockHeadings[1]);
    });

    it('renders table rows with correct content', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          defaultItemsPerPage={-1}
        />,
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(mockRows.length);

      // Check content of first few rows
      mockRows.forEach((row, index) => {
        expect(rows[index]).toHaveTextContent(row.content[0]);
        expect(rows[index]).toHaveTextContent(row.content[1]);
      });
    });

    it('renders slotBelow content when provided', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          slotBelow={<div data-testid="custom-content">Custom Content</div>}
        />,
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra sökning efter granskningar
   * se även ReviewsList.test.tsx
   * --------------------------------------------------------------- */

  describe('Möjliggöra sökning efter granskning', () => {
    it('renders freeText filter', () => {
      const mockOnChange = vi.fn();
      renderCardsOrTable({
        filters: [
          {
            type: 'freeText',
            label: 'Sök',
            values: [],
            onChange: mockOnChange,
          },
        ],
      });

      const searchInput = screen.getByTestId('digi-form-input-search');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onChange with search param when submitting search', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      renderCardsOrTable({
        filters: [
          {
            type: 'freeText',
            label: 'Sök',
            values: [],
            onChange: mockOnChange,
          },
        ],
      });

      const searchInput = screen.getByTestId('digi-form-input-search');
      await user.type(searchInput, 'test{enter}');

      // Verify onChange was called with the search term
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0].detail).toBe('test');
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Möjliggöra sortering av granskningar
   * se även ReviewsList.test.tsx
   * --------------------------------------------------------------- */
  describe('Möjliggöra sortering av granskningar', () => {
    it('applies sorting attributes to correct column', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          sortedByThIndex={0}
          sortDirection="stigande"
        />,
      );
      const firstHeader = container.querySelector('th');
      expect(firstHeader).toHaveAttribute('aria-sort', 'ascending');
      expect(firstHeader).toHaveClass('!border-b-2', '!border-sapphire-500');
    });

    it('applies descending sort attribute correctly', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={mockRows.length}
          sortedByThIndex={1}
          sortDirection="fallande"
        />,
      );
      const headers = container.querySelectorAll('th');
      expect(headers[1]).toHaveAttribute('aria-sort', 'descending');
    });

    it('displays rows in provided order with sort indicators applied', () => {
      const sortedRows = [
        { id: 1, posInSet: 1, content: ['Alice', '25'] },
        { id: 2, posInSet: 2, content: ['Bob', '30'] },
        { id: 3, posInSet: 3, content: ['Charlie', '35'] },
      ];

      const { container } = render(
        <CardsOrTable
          headings={['Name', 'Age']}
          rows={sortedRows}
          itemsName="objekt"
          totalItems={3}
          sortedByThIndex={0}
          sortDirection="stigande"
          defaultItemsPerPage={-1}
        />,
      );

      const tableRows = container.querySelectorAll('tbody tr');
      const firstHeader = container.querySelector('th');

      // Verify sort indicator is applied
      expect(firstHeader).toHaveAttribute('aria-sort', 'ascending');
      expect(firstHeader).toHaveClass('!border-b-2', '!border-sapphire-500');

      // Verify rows are in the provided sorted order
      expect(tableRows[0]).toHaveTextContent('Alice');
      expect(tableRows[1]).toHaveTextContent('Bob');
      expect(tableRows[2]).toHaveTextContent('Charlie');
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Rensa valda filter och sorteringar
   * se även ReviewsList.test.tsx
   * --------------------------------------------------------------- */
  describe('Rensa valda filter och sorteringar', () => {
    it('shows reset button when choicesMade is true', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          choicesMade={true}
          resetChoices={() => {}}
        />,
      );
      const resetButton = screen.getByText(i18n.t('ResetButtonDefaultText'));
      expect(resetButton).toBeInTheDocument();
    });

    it('does not show reset button when choicesMade is false', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          choicesMade={false}
        />,
      );
      const resetButton = screen.queryByText(i18n.t('ResetButtonDefaultText'));
      expect(resetButton).not.toBeInTheDocument();
    });

    it('calls resetChoices when reset button is clicked', async () => {
      const user = userEvent.setup();
      const mockResetChoices = vi.fn();
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          choicesMade={true}
          resetChoices={mockResetChoices}
        />,
      );

      const resetButton = screen.getByText(i18n.t('ResetButtonDefaultText'));
      await user.click(resetButton);

      expect(mockResetChoices).toHaveBeenCalledTimes(1);
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Välja antal granskningar per sida i tabellen
   * --------------------------------------------------------------- */
  describe('Välja antal granskningar per sida i tabellen', () => {
    it('renders context menu for page size when pagination is enabled', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          totalItems={mockRows.length}
          defaultItemsPerPage={10}
        />,
      );

      const contextMenu = document.getElementById('items-per-page-menu');
      expect(contextMenu).toBeInTheDocument();
    });

    it('does not render context menu when pagination is disabled', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          totalItems={mockRows.length}
          defaultItemsPerPage={-1}
        />,
      );

      const contextMenu = document.getElementById('items-per-page-menu');
      expect(contextMenu).not.toBeInTheDocument();
    });

    it('displays correct number of rows when page size is selected', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          defaultItemsPerPage={10}
        />,
      );

      // Initially should show 10 rows (default page size)
      let tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(10);

      // Verify initial menu title shows current page size
      let contextMenu = document.getElementById('items-per-page-menu');
      expect(contextMenu).toHaveAttribute(
        'data-title',
        `${i18n.t('CardsOrTable.ItemsPerPage')} (10)`,
      );

      // Select page size of 5
      const menuItem5 = screen.getByTestId('menu-item-5');
      await user.click(menuItem5);

      // Should now show 5 rows
      tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(5);

      // Verify menu title updated
      contextMenu = document.getElementById('items-per-page-menu');
      expect(contextMenu).toHaveAttribute(
        'data-title',
        `${i18n.t('CardsOrTable.ItemsPerPage')} (5)`,
      );

      // Select page size of 10
      const menuItem10 = screen.getByTestId('menu-item-10');
      await user.click(menuItem10);

      // Should now show 10 rows
      tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(10);
      expect(contextMenu).toHaveAttribute(
        'data-title',
        `${i18n.t('CardsOrTable.ItemsPerPage')} (10)`,
      );

      // Select "All" (id: 0)
      const menuItemAll = screen.getByTestId('menu-item-0');
      await user.click(menuItemAll);

      // Should show all 15 rows
      tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(mockRows.length);

      // Verify menu title shows "All"
      expect(contextMenu).toHaveAttribute(
        'data-title',
        `${i18n.t('CardsOrTable.ItemsPerPage')} (${i18n.t('CardsOrTable.All')})`,
      );
    });

    it('resets to page 1 when page size is changed', async () => {
      const user = userEvent.setup();
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={manyRows.length}
          defaultItemsPerPage={5}
        />,
      );

      // Initially should show first 5 rows (page 1)
      let tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(5);
      expect(tableRows[0]).toHaveTextContent('Row 1 Col 1');
      expect(tableRows[4]).toHaveTextContent('Row 5 Col 1');

      // Change page size to 10
      const menuItem10 = screen.getByTestId('menu-item-10');
      await user.click(menuItem10);

      // Should now show 10 rows starting from row 1 (reset to page 1)
      tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(10);
      expect(tableRows[0]).toHaveTextContent('Row 1 Col 1');
      expect(tableRows[9]).toHaveTextContent('Row 10 Col 1');

      // Change to a smaller page size
      const menuItem5 = screen.getByTestId('menu-item-5');
      await user.click(menuItem5);

      // Should show first 5 rows again (still on page 1)
      tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(5);
      expect(tableRows[0]).toHaveTextContent('Row 1 Col 1');
      expect(tableRows[4]).toHaveTextContent('Row 5 Col 1');
    });

    it('invokes onAfChangeItem callback with correct event details', async () => {
      const user = userEvent.setup();
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={mockRows.length}
          defaultItemsPerPage={10}
        />,
      );

      // Clear any previous calls
      contextMenuCallbacks.length = 0;

      // Click menu item for page size 5
      const menuItem5 = screen.getByTestId('menu-item-5');
      await user.click(menuItem5);

      // Verify callback was invoked with correct item details
      expect(contextMenuCallbacks).toHaveLength(1);
      expect(contextMenuCallbacks[0]).toEqual({
        item: { id: 5, title: '5' },
      });

      // Click menu item for "All" (id: 0)
      const menuItemAll = screen.getByTestId('menu-item-0');
      await user.click(menuItemAll);

      // Verify second callback
      expect(contextMenuCallbacks).toHaveLength(2);
      expect(contextMenuCallbacks[1]).toEqual({
        item: { id: 0, title: i18n.t('CardsOrTable.All') },
      });
    });
  });

  /* ---------------------------------------------------------------
   * Funktionellt krav: Bläddra bland granskningar via paginering
   * --------------------------------------------------------------- */
  describe('Bläddra bland granskningar via paginering', () => {
    it('renders all rows when pageSize is -1 (no pagination)', () => {
      const { container } = renderCardsOrTable({
        itemsName: 'granskningar',
        defaultItemsPerPage: -1,
      });
      // All 15 rows should be displayed
      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(mockRows.length);
    });

    it('renders only first page when pageSize is set', () => {
      const { container } = renderCardsOrTable({ defaultItemsPerPage: 2 });
      // Should show pagination component when rows exceed page size
      const pagination = screen.getByTestId('digi-navigation-pagination');
      expect(pagination).toBeInTheDocument();
      expect(container.textContent).toContain('Row 1 Col 1');
      expect(container.textContent).toContain('Row 2 Col 1');
      expect(container.textContent).not.toContain('Row 3 Col 1');
    });

    it('resets to page 1 when filtering reduces rows below current page', () => {
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      const { rerender, container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      // Verify pagination exists
      let pagination = screen.queryByTestId('digi-navigation-pagination');
      expect(pagination).toBeInTheDocument();

      // Now filter to just 2 rows (simulating what happens after filtering)
      const filteredRows = manyRows.slice(0, 2);
      rerender(
        <CardsOrTable
          headings={mockHeadings}
          rows={filteredRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      // Should show both filtered rows (pagination reset works)
      expect(container.textContent).toContain('Row 1 Col 1');
      expect(container.textContent).toContain('Row 2 Col 1');

      // Verify pagination NOT exists
      pagination = screen.queryByTestId('digi-navigation-pagination');
      expect(pagination).not.toBeInTheDocument();
    });

    it('navigates to next page when next button is clicked', async () => {
      const user = userEvent.setup();
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      // Initially on page 1, showing rows 1-10
      let tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(10);
      expect(tableRows[0]).toHaveTextContent('Row 1 Col 1');
      expect(tableRows[9]).toHaveTextContent('Row 10 Col 1');

      // Verify pagination info shows correct range
      const paginationInfo = screen.getByTestId('pagination-info');
      expect(paginationInfo).toHaveTextContent('1-10 av 25');

      // Click next button
      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).not.toBeDisabled();
      await user.click(nextButton);

      // Wait for state update and re-render
      await waitFor(() => {
        tableRows = container.querySelectorAll('tbody tr');
        expect(tableRows[0]).toHaveTextContent('Row 11 Col 1');
      });

      // Should now show rows 11-20
      expect(tableRows).toHaveLength(10);
      expect(tableRows[9]).toHaveTextContent('Row 20 Col 1');

      // Verify pagination info updated
      await waitFor(() => {
        const updatedInfo = screen.getByTestId('pagination-info');
        expect(updatedInfo).toHaveTextContent('11-20 av 25');
      });
    });

    it('navigates to previous page when previous button is clicked', async () => {
      const user = userEvent.setup();
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      // Go to page 2 first
      const nextButton = screen.getByTestId('pagination-next');
      await user.click(nextButton);

      let tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows[0]).toHaveTextContent('Row 11 Col 1');

      // Click previous button
      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).not.toBeDisabled();
      await user.click(prevButton);

      // Should be back to rows 1-10
      tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(10);
      expect(tableRows[0]).toHaveTextContent('Row 1 Col 1');
      expect(tableRows[9]).toHaveTextContent('Row 10 Col 1');

      const paginationInfo = screen.getByTestId('pagination-info');
      expect(paginationInfo).toHaveTextContent('1-10 av 25');
    });

    it('navigates to specific page when page number is clicked', async () => {
      const user = userEvent.setup();
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      // Click page 3 button
      const page3Button = screen.getByTestId('pagination-page-3');
      await user.click(page3Button);

      // Wait for state update and re-render
      await waitFor(() => {
        const tableRows = container.querySelectorAll('tbody tr');
        expect(tableRows[0]).toHaveTextContent('Row 21 Col 1');
      });

      // Should show rows 21-25 (last page)
      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(5);
      expect(tableRows[4]).toHaveTextContent('Row 25 Col 1');

      await waitFor(() => {
        const paginationInfo = screen.getByTestId('pagination-info');
        expect(paginationInfo).toHaveTextContent('21-25 av 25');
      });

      // Verify page 3 is marked as current
      await waitFor(() => {
        const updatedPage3Button = screen.getByTestId('pagination-page-3');
        expect(updatedPage3Button).toHaveAttribute('aria-current', 'page');
      });
    });

    it('disables previous button on first page', () => {
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).toBeDisabled();

      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).not.toBeDisabled();
    });

    it('disables next button on last page', async () => {
      const user = userEvent.setup();
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={25}
          defaultItemsPerPage={10}
        />,
      );

      // Navigate to last page (page 3)
      const page3Button = screen.getByTestId('pagination-page-3');
      await user.click(page3Button);

      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).toBeDisabled();

      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).not.toBeDisabled();
    });

    it('displays correct total pages in pagination', () => {
      const manyRows = Array.from({ length: 47 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1} Col 1`, `Row ${i + 1} Col 2`],
      }));

      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={47}
          defaultItemsPerPage={10}
        />,
      );

      const pagination = screen.getByTestId('digi-navigation-pagination');
      expect(pagination).toHaveAttribute('data-total-pages', '5');

      // Verify all 5 page buttons exist
      expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-page-2')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-page-3')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-page-4')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-page-5')).toBeInTheDocument();
    });
  });

  describe('filters', () => {
    // Check again when testing Kravöversikt
    it('renders select filter with options', () => {
      const mockOnChange = vi.fn();
      const mockOptions = [
        { id: 'option1', label: 'Option 1' },
        { id: 'option2', label: 'Option 2' },
      ];

      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={mockRows.length}
          filters={[
            {
              type: 'select',
              label: 'Filter',
              options: mockOptions,
              values: [],
              onChange: mockOnChange,
            },
          ]}
        />,
      );

      const filter = screen.getByTestId('digi-form-filter');
      expect(filter).toBeInTheDocument();

      // Verify the options are passed to the filter component
      expect(filter).toHaveAttribute('data-filter-button-text', 'Filter');
      expect(filter).toHaveAttribute('data-submit-button-text', 'Filtrera');

      // Verify the options are passed
      const listItems = JSON.parse(filter.getAttribute('data-list-items') || '[]');
      expect(listItems).toEqual(mockOptions);
    });

    it('does not render select filter with only one option', () => {
      const mockOnChange = vi.fn();
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={mockRows.length}
          filters={[
            {
              type: 'select',
              label: 'Filter',
              options: [{ id: 'option1', label: 'Option 1' }],
              values: [],
              onChange: mockOnChange,
            },
          ]}
        />,
      );

      const filter = document.querySelector('digi-form-filter');
      expect(filter).not.toBeInTheDocument();
    });

    it('renders multiple filters', () => {
      const mockOnChange1 = vi.fn();
      const mockOnChange2 = vi.fn();
      const categoryOptions = [
        { id: 'cat1', label: 'Category 1' },
        { id: 'cat2', label: 'Category 2' },
      ];

      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={mockRows.length}
          filters={[
            {
              type: 'freeText',
              label: 'Sök',
              values: [],
              onChange: mockOnChange1,
            },
            {
              type: 'select',
              label: 'Kategori',
              options: categoryOptions,
              values: [],
              onChange: mockOnChange2,
            },
          ]}
        />,
      );

      const searchInput = screen.getByTestId('digi-form-input-search');
      const filter = screen.getByTestId('digi-form-filter');

      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('data-label', 'Sök');

      expect(filter).toBeInTheDocument();
      expect(filter).toHaveAttribute('data-filter-button-text', 'Kategori');

      // Verify the category options are passed
      const listItems = JSON.parse(filter.getAttribute('data-list-items') || '[]');
      expect(listItems).toEqual(categoryOptions);
    });
  });
});
