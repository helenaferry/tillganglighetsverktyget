import {
  type FormFilterItem,
  FormInputSearchVariation,
  FormInputType,
  LinkVariation,
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
  rows: RowWithId[];
  totalItems: number;
  defaultItemsPerPage?: number;
  searchLabel?: string;
  filters?: FilterProps[];
}

{
  /* TODO enum för kravstatusar? Har olika */
}
export function CardsOrTable({
  headings,
  rows,
  totalItems,
  defaultItemsPerPage = -1,
  filters,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationStart, setPaginationStart] = useState(1);
  const [paginationEnd, setPaginationEnd] = useState(defaultItemsPerPage);
  const [pageSize, setPageSize] = useState(defaultItemsPerPage);

  const paginatedRows = useMemo(() => {
    if (!pageSize || pageSize <= 0) return rows;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaginationStart(start + 1);
    setPaginationEnd(end > rows.length ? rows.length : end);
    return rows.slice(start, end);
  }, [rows, pageSize, currentPage]);

  return (
    <div className="w-full">
      {filters && filters.length > 0 && (
        <form
          className="cards-or-table__filters flex flex-col lg:flex-row gap-4 justify-between"
          aria-label="Sök och filtrera"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            {filters &&
              filters.map((filter) => (
                <div key={filter.label}>
                  {filter.type === 'freeText' && (
                    <DigiFormInputSearch
                      afLabel={filter.label}
                      afVariation={FormInputSearchVariation.MEDIUM}
                      afType={FormInputType.SEARCH}
                      afHideButton={true}
                      onAfOnInput={(e) => {
                        filter.onChange(e);
                      }}
                    ></DigiFormInputSearch>
                  )}
                  {filter.type === 'select' && filter.options && filter.options.length > 1 && (
                    <div key={filter.label} className="mb-[0.3rem]">
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
                  } else {
                    setPageSize(Number(e.detail.item.id));
                    setPaginationStart(1);
                    setPaginationEnd(Number(e.detail.item.id));
                    setCurrentPage(1);
                  }
                }}
              ></DigiContextMenu>
            </div>
          )}
        </form>
      )}
      <div className="hidden lg:block">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Visar {rows.length} av {totalItems} {headings[0]}
        </div>
        <DigiTable afSize={TableSize.MEDIUM}>
          <table aria-rowcount={rows.length} className="mt-6">
            <thead>
              <tr>
                {headings.map((heading, index) =>
                  index === 0 ? (
                    <th scope="col" key={index} aria-label={heading as string}>
                      Visar {rows.length} av {totalItems} {heading}
                    </th>
                  ) : (
                    <th scope="col" key={index}>
                      {heading}
                    </th>
                  ),
                )}
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
      <div className="lg:hidden space-y-4">
        <div role="alert" className="font-bold mt-4">
          Visar {rows.length} av {totalItems} {headings[0]}
        </div>
        <div className="border-t-1 mt-6">
          {paginatedRows.map((row) => (
            <div
              key={row.id}
              aria-setsize={rows.length}
              aria-posinset={row.posInSet}
              className="border-b-1 py-4"
            >
              <p className="my-4!">
                <DigiLinkInternal afHref="#" afVariation={LinkVariation.SMALL}>
                  {row.content[0]}
                </DigiLinkInternal>
              </p>
              {row.content.slice(1).map((cell, cellIndex) => (
                <div key={`${row.id}-cell-${cellIndex + 1}`} className="mb-2">
                  {headings[cellIndex + 1] && (
                    <div className="font-bold mb-0">{headings[cellIndex + 1]}: </div>
                  )}
                  <div>{cell}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {pageSize > 0 && rows.length > pageSize && (
        <div className="mt-10">
          <DigiNavigationPagination
            afTotalPages={Math.ceil(rows.length / pageSize)}
            afInitActive-page={currentPage}
            afCurrentResultStart={paginationStart}
            afCurrentResultEnd={paginationEnd}
            afTotalResults={rows.length}
            onAfOnPageChange={(e) => setCurrentPage(e.detail)}
          ></DigiNavigationPagination>
        </div>
      )}
    </div>
  );
}
