import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import i18n from '../../lang/i18n';
import { CardsOrTable } from '../CardsOrTable';

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
      onAfOnSubmitSearch?: (e: CustomEvent) => void;
    }) => (
      <input
        data-testid="digi-form-input-search"
        data-label={afLabel}
        defaultValue={afValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onAfOnSubmitSearch) {
            onAfOnSubmitSearch(
              new CustomEvent('submit', { detail: (e.target as HTMLInputElement).value }) as any,
            );
          }
        }}
        {...props}
      />
    ),
  };
});

const mockRows = [
  { id: 1, posInSet: 1, content: ['Row 1 Col 1', 'Row 1 Col 2'] },
  { id: 2, posInSet: 2, content: ['Row 2 Col 1', 'Row 2 Col 2'] },
  { id: 3, posInSet: 3, content: ['Row 3 Col 1', 'Row 3 Col 2'] },
];

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
   * Funktionellt krav: Möjliggöra sökning efter granskningar.
   * - renders freeText filter
   * - calls onChange with search param when submitting search
   * see also ReviewsList.test.tsx
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

  describe('hitsText rendering', () => {
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
          totalItems={3}
        />,
      );
      expect(container.textContent).toContain('3 granskningar');
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
  });

  describe('pagination', () => {
    it('renders all rows when pageSize is -1 (no pagination)', () => {
      const { container } = renderCardsOrTable({
        itemsName: 'granskningar',
        defaultItemsPerPage: -1,
      });
      // All rows should be present
      expect(container.textContent).toContain('Row 1 Col 1');
      expect(container.textContent).toContain('Row 2 Col 1');
      expect(container.textContent).toContain('Row 3 Col 1');
    });

    it('renders only first page when pageSize is set', () => {
      const { container } = renderCardsOrTable({ defaultItemsPerPage: 2 });
      // Should show pagination component when rows exceed page size
      const pagination = document.querySelector('digi-navigation-pagination');
      expect(pagination).toBeInTheDocument();
      expect(container.textContent).toContain('Row 1 Col 1');
      expect(container.textContent).toContain('Row 2 Col 1');
      expect(container.textContent).not.toContain('Row 3 Col 1');
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
      const pagination = container.querySelector('digi-navigation-pagination');
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
      const paginationAfter = container.querySelector('digi-navigation-pagination');
      expect(paginationAfter).not.toBeInTheDocument();
    });
  });

  describe('table structure', () => {
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
          totalItems={3}
          defaultItemsPerPage={-1}
        />,
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(3);

      // Check content of each row
      expect(rows[0]).toHaveTextContent(mockRows[0].content[0]);
      expect(rows[0]).toHaveTextContent(mockRows[0].content[1]);
      expect(rows[1]).toHaveTextContent(mockRows[1].content[0]);
      expect(rows[1]).toHaveTextContent(mockRows[1].content[1]);
      expect(rows[2]).toHaveTextContent(mockRows[2].content[0]);
      expect(rows[2]).toHaveTextContent(mockRows[2].content[1]);
    });
  });

  describe('reset functionality', () => {
    it('shows reset button when choicesMade is true', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={3}
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
          totalItems={3}
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
          totalItems={3}
          choicesMade={true}
          resetChoices={mockResetChoices}
        />,
      );

      const resetButton = screen.getByText(i18n.t('ResetButtonDefaultText'));
      await user.click(resetButton);

      expect(mockResetChoices).toHaveBeenCalledTimes(1);
    });
  });

  describe('slotBelow prop', () => {
    it('renders slotBelow content when provided', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={3}
          slotBelow={<div data-testid="custom-content">Custom Content</div>}
        />,
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  describe('sorting attributes', () => {
    it('applies sorting attributes to correct column', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="granskningar"
          itemsNameSingular="granskning"
          totalItems={3}
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
          totalItems={3}
          sortedByThIndex={1}
          sortDirection="fallande"
        />,
      );
      const headers = container.querySelectorAll('th');
      expect(headers[1]).toHaveAttribute('aria-sort', 'descending');
    });

    it('displays rows in the exact order provided', () => {
      const orderedRows = [
        { id: 3, posInSet: 1, content: ['Charlie', 'Third'] },
        { id: 1, posInSet: 2, content: ['Alice', 'First'] },
        { id: 2, posInSet: 3, content: ['Bob', 'Second'] },
      ];

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={orderedRows}
          itemsName="objekt"
          totalItems={3}
          defaultItemsPerPage={-1}
        />,
      );

      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(3);

      // Verify rows are displayed in the exact order they were provided
      expect(tableRows[0]).toHaveTextContent('Charlie');
      expect(tableRows[0]).toHaveTextContent('Third');
      expect(tableRows[1]).toHaveTextContent('Alice');
      expect(tableRows[1]).toHaveTextContent('First');
      expect(tableRows[2]).toHaveTextContent('Bob');
      expect(tableRows[2]).toHaveTextContent('Second');
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

  describe('filters', () => {
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
          totalItems={3}
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
          totalItems={3}
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
          totalItems={3}
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

  describe('items per page selector', () => {
    it('renders context menu for page size when pagination is enabled', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
          defaultItemsPerPage={10}
        />,
      );

      const contextMenu = document.querySelector('digi-context-menu');
      expect(contextMenu).toBeInTheDocument();
    });

    it('does not render context menu when pagination is disabled', () => {
      render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
          defaultItemsPerPage={-1}
        />,
      );

      const contextMenu = document.querySelector('digi-context-menu');
      expect(contextMenu).not.toBeInTheDocument();
    });
  });

  describe('cardsHeadings prop', () => {
    it('sets aria-label on table headers when cardsHeadings provided', () => {
      const customCardsHeadings = ['Name Column', 'Status Column'];
      const { container } = render(
        <CardsOrTable
          headings={['Name', 'Status']}
          cardsHeadings={customCardsHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
        />,
      );

      const headers = container.querySelectorAll('th');
      expect(headers[0]).toHaveAttribute('aria-label', 'Name Column');
      expect(headers[1]).toHaveAttribute('aria-label', 'Status Column');
    });

    it('displays cardsHeadings as labels in card view for data cells', () => {
      const customCardsHeadings = ['Name', 'Age', 'City'];
      const cardRows = [{ id: 1, posInSet: 1, content: ['Alice', '25', 'Stockholm'] }];

      const { container } = render(
        <CardsOrTable
          headings={['Name', 'Age', 'City']}
          cardsHeadings={customCardsHeadings}
          rows={cardRows}
          itemsName="objekt"
          totalItems={1}
        />,
      );

      // In card view (mobile), cardsHeadings should appear as labels
      // cardsHeadings[1] and cardsHeadings[2] should be visible (first column doesn't get a label)
      const cards = container.querySelector('ul.\\!list-none');
      expect(cards).toBeInTheDocument();
      expect(cards).toHaveTextContent('Age:');
      expect(cards).toHaveTextContent('City:');
      // First item (Name) doesn't get a label in cards view
      expect(cards).toHaveTextContent('Alice');
      expect(cards).toHaveTextContent('25');
      expect(cards).toHaveTextContent('Stockholm');
    });

    it('works without cardsHeadings (optional prop)', () => {
      const { container } = render(
        <CardsOrTable headings={mockHeadings} rows={mockRows} itemsName="objekt" totalItems={3} />,
      );

      const headers = container.querySelectorAll('th');
      expect(headers[0]).not.toHaveAttribute('aria-label');
      expect(headers[1]).not.toHaveAttribute('aria-label');
    });
  });

  describe('displayHeadingsAboveCards prop', () => {
    it('shows sort buttons above cards when displayHeadingsAboveCards is true', () => {
      const { container } = render(
        <CardsOrTable
          headings={['Name', 'Age']}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
          displayHeadingsAboveCards={true}
        />,
      );

      // Should render the fieldset with "Sortera på:" legend in card view
      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();
      expect(fieldset).toHaveTextContent('Sortera på:');
    });

    it('hides sort buttons above cards when displayHeadingsAboveCards is false', () => {
      const { container } = render(
        <CardsOrTable
          headings={['Name', 'Age']}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
          displayHeadingsAboveCards={false}
        />,
      );

      // Fieldset should still exist but not show the headings
      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();
      // The headings should not be rendered inside the fieldset when false
      const headingsInFieldset = fieldset?.querySelectorAll('div[aria-label]');
      expect(headingsInFieldset).toHaveLength(0);
    });
  });

  describe('mainColumnIndex prop', () => {
    it('applies w-full class to the main column', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
          mainColumnIndex={1}
          defaultItemsPerPage={-1}
        />,
      );

      // Second column (index 1) should have w-full class
      const tableRows = container.querySelectorAll('tbody tr');
      const firstRowCells = tableRows[0].querySelectorAll('td');

      expect(firstRowCells[0]).not.toHaveClass('w-full');
      expect(firstRowCells[1]).toHaveClass('w-full');
    });

    it('defaults to first column when mainColumnIndex not specified', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="objekt"
          totalItems={3}
          defaultItemsPerPage={-1}
        />,
      );

      const tableRows = container.querySelectorAll('tbody tr');
      const firstRowCells = tableRows[0].querySelectorAll('td');

      expect(firstRowCells[0]).toHaveClass('w-full');
    });
  });

  describe('edge cases', () => {
    it('handles zero pageSize (show all)', () => {
      const manyRows = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        posInSet: i + 1,
        content: [`Row ${i + 1}`, 'Content'],
      }));

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={manyRows}
          itemsName="objekt"
          totalItems={100}
          defaultItemsPerPage={0}
        />,
      );

      // Should show all rows
      expect(container.textContent).toContain('Row 1');
      expect(container.textContent).toContain('Row 100');
    });

    it('handles rows with different content lengths', () => {
      const irregularRows = [
        { id: 1, posInSet: 1, content: ['A'] },
        { id: 2, posInSet: 2, content: ['B', 'C', 'D'] },
        { id: 3, posInSet: 3, content: ['E', 'F'] },
      ];

      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={irregularRows}
          itemsName="objekt"
          totalItems={3}
        />,
      );

      expect(container.textContent).toContain('A');
      expect(container.textContent).toContain('D');
      expect(container.textContent).toContain('F');
    });

    it('handles very long item names', () => {
      const { container } = render(
        <CardsOrTable
          headings={mockHeadings}
          rows={mockRows}
          itemsName="very-long-item-name-that-might-cause-layout-issues-in-Swedish"
          itemsNameSingular="ett-mycket-långt-objektnamn"
          totalItems={3}
        />,
      );

      expect(container.textContent).toContain('very-long-item-name');
    });
  });
});
