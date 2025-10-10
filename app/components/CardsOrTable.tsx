import { TableSize } from '@digi/arbetsformedlingen';
import { DigiTable } from '@digi/arbetsformedlingen-react';
import type { ReactNode } from 'react';

interface Props {
  headings: ReactNode[];
  rows: ReactNode[][];
}
export function CardsOrTable({ headings, rows }: Props) {
  return (
    <div className="w-full">
      <div className="hidden lg:block">
        <DigiTable afSize={TableSize.MEDIUM}>
          <table>
            <thead>
              <tr>
                {headings.map((heading, index) => (
                  <th key={index}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </DigiTable>
      </div>
      <div className="lg:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="border-b-1">
            <p>{row[0]}</p>
            {row.slice(1).map((cell, cellIndex) => (
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
    </div>
  );
}
