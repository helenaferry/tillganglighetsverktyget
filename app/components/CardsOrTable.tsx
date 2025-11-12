import {
  ButtonVariation,
  type FormFilterItem,
  FormInputSearchVariation,
  FormInputType,
  TableSize,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiContextMenu,
  DigiFormFilter,
  DigiFormInputSearch,
  DigiIconRedo,
  DigiNavigationPagination,
  DigiTable,
} from '@designsystem-se/af-react';
import { type ReactNode, useMemo, useState } from 'react';

interface FilterProps {
  type: 'freeText' | 'select';
  label: string;
  options?: FormFilterItem[];
  values?: string[];
  onChange: (e: CustomEvent) => void;
}

interface RowWithId {
  id: string | number;
  posInSet: number;
  content: ReactNode[];
}

interface Props {
  headings: ReactNode[];
  cardsHeadings?: ReactNode[];
  rows: RowWithId[];
  itemsName?: string;
  itemsNameSingular?: string;
  totalItems: number;
  defaultItemsPerPage?: number;
  searchLabel?: string;
  filters?: FilterProps[];
  sortedByThIndex?: number;
  sortDirection?: 'stigande' | 'fallande';
  displayHeadingsAboveCards?: boolean;
  resetChoices?: () => void;
  choicesMade?: boolean;
}

export function CardsOrTable({
  headings,
  cardsHeadings,
  rows,
  itemsName = 'objekt',
  itemsNameSingular = itemsName,
  totalItems,
  defaultItemsPerPage = -1,
  filters,
  sortedByThIndex,
  sortDirection,
  displayHeadingsAboveCards = true,
  resetChoices,
  choicesMade = false,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationStart, setPaginationStart] = useState(1);
  const [paginationEnd, setPaginationEnd] = useState(defaultItemsPerPage);
  const [pageSize, setPageSize] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState(
    filters?.find((f) => f.type === 'freeText')?.values?.[0] || '',
  );
  const [filterKey, setFilterKey] = useState(0);
  const [paginationKey, setPaginationKey] = useState(0);

  const paginatedRows = useMemo(() => {
    if (!pageSize || pageSize <= 0) return rows;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaginationStart(start + 1);
    setPaginationEnd(end > rows.length ? rows.length : end);
    return rows.slice(start, end);
  }, [rows, pageSize, currentPage]);

  const reset = () => {
    setSearchTerm('');
    setFilterKey(filterKey + 1);
    setPageSize(defaultItemsPerPage);
    setCurrentPage(1);
    setPaginationKey(paginationKey + 1);
    if (resetChoices) {
      resetChoices();
    }
  };

  const hitsText = useMemo(() => {
    if (rows.length === 1) {
      return `1 ${itemsNameSingular} ${totalItems > 1 ? 'hittades' : ''}`;
    } else {
      return `${rows.length} ${itemsName} ${totalItems > rows.length ? 'hittades' : ''}`;
    }
  }, [rows]);

  return (
    <div className="cards-or-table w-full">
      {filters && filters.length > 0 && (
        <form
          className="cards-or-table__filters flex flex-col lg:flex-row gap-4 justify-between"
          aria-label="Sök och filtrera"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            {filters &&
              filters.map((filter) => (
                <div key={filter.label} className="max-w-[14rem] sm:max-w-none">
                  {filter.type === 'freeText' && (
                    <DigiFormInputSearch
                      afLabel={filter.label}
                      afVariation={FormInputSearchVariation.MEDIUM}
                      afType={FormInputType.SEARCH}
                      afValue={searchTerm}
                      afButtonText="Sök"
                      onAfOnSubmitSearch={(e) => {
                        setSearchTerm(e.detail);
                        filter.onChange(e);
                      }}
                    ></DigiFormInputSearch>
                  )}
                  {filter.type === 'select' && filter.options && filter.options.length > 1 && (
                    <div key={filter.label + filterKey} className="mb-[0.4rem]">
                      <DigiFormFilter
                        afFilterButtonText={filter.label}
                        afSubmitButtonText="Filtrera"
                        afListItems={filter.options}
                        onAfSubmitFilter={(e) => {
                          filter.onChange(e);
                        }}
                        afCheckItems={filter.values}
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mt-4 mb-">
        <div className="flex flex-col md:flex-row md:items-center">
          <span className="font-bold" aria-live="polite" aria-atomic="true">
            {hitsText}
          </span>
          {choicesMade && (
            <span className="inline-flex md:ml-4">
              <DigiButton
                afVariation={ButtonVariation.FUNCTION}
                onAfOnClick={reset}
                afFullWidth={false}
              >
                Rensa dina val
                <DigiIconRedo slot="icon" />
              </DigiButton>
            </span>
          )}
        </div>
        {pageSize > -1 && (
          <div>
            <DigiContextMenu
              afTitle={`Antal per sida (${pageSize === 0 ? 'Alla' : pageSize})`}
              afMenuPosition="left-bottom"
              afMenuItems={[
                { id: 5, title: '5' },
                { id: 10, title: '10' },
                { id: 20, title: '20' },
                { id: 50, title: '50' },
                { id: 100, title: '100' },
                { id: 150, title: '150' },
                { id: 200, title: '200' },
                { id: 0, title: 'Alla' },
              ].filter((item) => item.id === 0 || (rows.length > 0 && item.id <= rows.length))}
              onAfChangeItem={(e) => {
                if (e.detail.item.id === 0) {
                  setPageSize(0);
                  setPaginationStart(1);
                  setPaginationEnd(rows.length);
                  setCurrentPage(1);
                  setPaginationKey(paginationKey + 1);
                } else {
                  setPageSize(Number(e.detail.item.id));
                  setPaginationStart(1);
                  setPaginationEnd(Number(e.detail.item.id));
                  setCurrentPage(1);
                  setPaginationKey(paginationKey + 1);
                }
              }}
            ></DigiContextMenu>
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <DigiTable afSize={TableSize.MEDIUM}>
          <table aria-rowcount={rows.length} className="mt-6">
            <caption className="sr-only">Tabell med {itemsName}</caption>
            <thead>
              <tr>
                {headings.map((heading, index) => (
                  <th
                    scope="col"
                    key={`${index}-${headings.length}`}
                    aria-label={
                      cardsHeadings && typeof cardsHeadings[index] === 'string'
                        ? (cardsHeadings[index] as string)
                        : undefined
                    }
                    aria-sort={
                      sortedByThIndex === index
                        ? sortDirection === 'stigande'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`${index === 0 ? 'w-full' : ''} ${sortedByThIndex === index ? '!border-b-2 !border-sapphire-500' : ''}`}
                    onClick={() => {
                      if (heading && pageSize > 0 && rows.length > pageSize) {
                        setCurrentPage(1);
                        setPaginationKey(paginationKey + 1);
                      }
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.id} aria-rowindex={row.posInSet}>
                  {row.content.map((cell, cellIndex) => (
                    <td key={`${row.id}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </DigiTable>
      </div>
      {/* Cards view */}
      <div className="lg:hidden space-y-4">
        <fieldset>
          <legend className="font-bold py-5">Sortera på:</legend>
          {displayHeadingsAboveCards && (
            <div>
              {headings.map((heading, index) => (
                <div
                  key={`hac-${index}-${headings.length}`}
                  aria-label={
                    cardsHeadings && typeof cardsHeadings[index] === 'string'
                      ? (cardsHeadings[index] as string)
                      : undefined
                  }
                  className={`${index === 0 ? 'w-full' : ''} pb-5`}
                >
                  {heading}
                </div>
              ))}
            </div>
          )}
        </fieldset>
        <ul
          className="!list-none border-t-1 mt-6 !p-0"
          aria-label={
            pageSize > 0 && rows.length > pageSize
              ? `Sida ${currentPage} av ${Math.ceil(rows.length / pageSize)}`
              : undefined
          }
          aria-describedby="list-description"
        >
          {paginatedRows.map((row) => (
            <li
              key={row.id}
              aria-setsize={rows.length}
              aria-posinset={row.posInSet}
              className="border-b-1 py-4"
            >
              <p className="my-4!">{row.content[0]}</p>
              {row.content.slice(1).map((cell, cellIndex) => (
                <div key={`${row.id}-cell-${cellIndex + 1}`} className="mb-2">
                  {cardsHeadings && cardsHeadings[cellIndex + 1] && (
                    <div className="font-bold mb-0">{cardsHeadings[cellIndex + 1]}: </div>
                  )}
                  <div>{cell}</div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
      {pageSize > 0 && rows.length > pageSize && (
        <div className="mt-10 min-h-[20rem] md:min-h-0" key={`pagination-${paginationKey}`}>
          <div className="absolute md:relative left-0 right-0 w-screen md:w-full">
            <DigiNavigationPagination
              afTotalPages={Math.ceil(rows.length / pageSize)}
              afInitActivePage={currentPage}
              afCurrentResultStart={paginationStart}
              afCurrentResultEnd={paginationEnd}
              afTotalResults={rows.length}
              onAfOnPageChange={(e) => setCurrentPage(e.detail)}
            ></DigiNavigationPagination>
          </div>
        </div>
      )}
    </div>
  );
}
