import {
  type FormFilterItem,
  FormInputSearchVariation,
  FormInputType,
  TableSize,
} from '@digi/arbetsformedlingen';
import {
  DigiContextMenu,
  DigiFormFilter,
  DigiFormInputSearch,
  DigiLinkInternal,
  DigiNavigationPagination,
  DigiTable,
} from '@digi/arbetsformedlingen-react';
import { type ReactNode, useMemo, useState } from 'react';

interface FilterProps {
  type: 'freeText' | 'select';
  label: string;
  options?: FormFilterItem[];
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
  totalItems: number;
  defaultItemsPerPage?: number;
  searchLabel?: string;
  filters?: FilterProps[];
  sortedByThIndex?: number;
  sortDirection?: 'ascending' | 'descending';
  displayHeadingsAboveCards?: boolean;
  resetChoices?: () => void;
  choicesMade?: boolean;
}

export function CardsOrTable({
  headings,
  cardsHeadings,
  rows,
  itemsName = 'objekt',
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
  const [searchTerm, setSearchTerm] = useState('');
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
                      onAfOnSubmitSearch={(e) => {
                        setSearchTerm(e.detail);
                        filter.onChange(e);
                      }}
                    ></DigiFormInputSearch>
                  )}
                  {filter.type === 'select' && filter.options && filter.options.length > 1 && (
                    <div key={filter.label + filterKey} className="mb-[0.3rem]">
                      <DigiFormFilter
                        afFilterButtonText={filter.label}
                        afSubmitButtonText="Filtrera"
                        afListItems={filter.options}
                        onAfSubmitFilter={(e) => {
                          filter.onChange(e);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
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
                  { id: 0, title: 'Alla' },
                ]}
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
        </form>
      )}
      <div className="hidden lg:block">
        <DigiTable afSize={TableSize.MEDIUM}>
          <table aria-rowcount={rows.length} className="mt-6">
            <caption className="text-left mb-4 mx-3" aria-live="polite" aria-atomic="true">
              <span className="font-bold">
                Visar {rows.length} av {totalItems} {itemsName}{' '}
              </span>
              {choicesMade && (
                <span>
                  -{' '}
                  <button
                    type="button"
                    className="text-sapphire-500 hover:underline"
                    onClick={reset}
                  >
                    Rensa dina val
                  </button>
                </span>
              )}
            </caption>
            <thead>
              <tr>
                {headings.map((heading, index) => (
                  <th
                    scope="col"
                    key={index}
                    aria-label={
                      cardsHeadings && typeof cardsHeadings[index] === 'string'
                        ? (cardsHeadings[index] as string)
                        : undefined
                    }
                    aria-sort={sortedByThIndex === index ? sortDirection : undefined}
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
        <div role="alert" className="mt-4">
          <span className="font-bold" id="list-description">
            Visar {rows.length} av {totalItems} {itemsName}{' '}
          </span>
          {choicesMade && (
            <span>
              -{' '}
              <button type="button" className="text-sapphire-500 hover:underline" onClick={reset}>
                Rensa dina val
              </button>
            </span>
          )}
        </div>
        <fieldset>
          <legend className="font-bold mb-2">Sortera på:</legend>
          {displayHeadingsAboveCards && (
            <div>
              {headings.map((heading, index) => (
                <div
                  key={index}
                  aria-label={
                    cardsHeadings && typeof cardsHeadings[index] === 'string'
                      ? (cardsHeadings[index] as string)
                      : undefined
                  }
                  className={`${index === 0 ? 'w-full' : ''}`}
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
              <p className="my-4!">
                <DigiLinkInternal afHref="#">{row.content[0]}</DigiLinkInternal>
              </p>
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
