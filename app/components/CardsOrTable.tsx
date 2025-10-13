import { type IListItem, TableSize } from '@digi/arbetsformedlingen';
import {
  DigiFormInput,
  DigiFormSelectFilter,
  DigiNavigationPagination,
  DigiTable,
} from '@digi/arbetsformedlingen-react';
import { type ReactNode, useMemo, useState } from 'react';

interface FilterProps {
  type: 'freeText' | 'select';
  label: string;
  options?: IListItem[];
  onChange: (e: CustomEvent) => void;
}

interface Props {
  headings: ReactNode[];
  rows: ReactNode[][];
  itemsPerPage?: number;
  searchLabel?: string;
  filters?: FilterProps[];
}

{
  /* TODO enum för kravstatusar? Har olika */
}
export function CardsOrTable({ headings, rows, itemsPerPage = 0, filters }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationStart, setPaginationStart] = useState(1);
  const [paginationEnd, setPaginationEnd] = useState(itemsPerPage);

  const rowsWithPosInSet = useMemo(() => {
    return rows.map((row, index) => ({ content: row, posInSet: index + 1 }));
  }, [rows]);

  const paginatedRows = useMemo(() => {
    if (!itemsPerPage) return rowsWithPosInSet;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginationStart(start + 1);
    setPaginationEnd(end > rows.length ? rows.length : end);
    return rowsWithPosInSet.slice(start, end);
  }, [rows, itemsPerPage, currentPage]);

  return (
    <div className="w-full">
      <div className="hidden lg:block">
        {filters && filters.length > 0 && (
          <form className="md:flex md:gap-4">
            {filters &&
              filters.map((filter, index) => (
                <div className="md:w-1/4" key={index}>
                  {filter.type === 'freeText' && (
                    <DigiFormInput
                      afLabel={filter.label}
                      onAfOnInput={(e) => {
                        filter.onChange(e);
                      }}
                    />
                  )}
                  {filter.type === 'select' && filter.options && filter.options.length > 1 && (
                    <DigiFormSelectFilter
                      afFilterButtonTextLabel={filter.label}
                      afFilterButtonText="Visa alla"
                      afName="Sök"
                      afSubmitButtonText="Filtrera"
                      afMultipleItems={true}
                      sortAlphabetically={false}
                      afListItems={filter.options}
                      onAfOnSubmitFilters={(e) => {
                        filter.onChange(e);
                      }}
                    />
                  )}
                </div>
              ))}
          </form>
        )}
        <p role="status">Totalt {rows.length} st</p>
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
      {itemsPerPage > 0 && rows.length > itemsPerPage && (
        <div className="mt-10">
          <DigiNavigationPagination
            afTotalPages={Math.ceil(rows.length / itemsPerPage)}
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
