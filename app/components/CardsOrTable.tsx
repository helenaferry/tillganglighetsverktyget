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

interface Props {
  headings: ReactNode[];
  rows: ReactNode[][];
  defaultItemsPerPage?: number;
  searchLabel?: string;
  filters?: FilterProps[];
}

{
  /* TODO enum för kravstatusar? Har olika */
}
export function CardsOrTable({ headings, rows, defaultItemsPerPage = -1, filters }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationStart, setPaginationStart] = useState(1);
  const [paginationEnd, setPaginationEnd] = useState(defaultItemsPerPage);
  const [pageSize, setPageSize] = useState(defaultItemsPerPage);

  const rowsWithPosInSet = useMemo(() => {
    return rows.map((row, index) => ({ content: row, posInSet: index + 1 }));
  }, [rows]);

  const paginatedRows = useMemo(() => {
    if (!pageSize || pageSize <= 0) return rowsWithPosInSet;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaginationStart(start + 1);
    setPaginationEnd(end > rows.length ? rows.length : end);
    return rowsWithPosInSet.slice(start, end);
  }, [rows, pageSize, currentPage]);

  return (
    <div className="w-full">
      {filters && filters.length > 0 && (
        <form
          className="cards-or-table__filters md:flex md:gap-4 justify-between"
          aria-label="Sök och filtrera"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="md:flex md:gap-4 items-end">
            {filters &&
              filters.map((filter, index) => (
                <div key={index}>
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
                    <div key={index} className="mb-[0.3rem]">
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
      <p role="status">Totalt {rows.length} st</p>
      <div className="hidden lg:block">
        <DigiTable afSize={TableSize.MEDIUM}>
          <table aria-rowcount={rows.length}>
            <thead>
              <tr>
                {headings.map((heading, index) => (
                  <th key={index}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr key={rowIndex} aria-rowindex={row.posInSet}>
                  {row.content.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </DigiTable>
      </div>
      <div className="lg:hidden space-y-4">
        {paginatedRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            aria-setsize={rows.length}
            aria-posinset={row.posInSet}
            className="border-b-1"
          >
            <p>{row.content[0]}</p>
            {row.content.slice(1).map((cell, cellIndex) => (
              <div key={cellIndex + 1} className="mb-2">
                {headings[cellIndex + 1] && (
                  <span className="font-bold">{headings[cellIndex + 1]}: </span>
                )}
                <span>{cell}</span>
              </div>
            ))}
          </div>
        ))}
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
