import { DigiIconCaretDown, DigiIconCaretUp } from '@digi/arbetsformedlingen-react';

type Props = {
  buttonText: string;
  sortBy: number;
  active?: boolean;
  sortDirection: 'ascending' | 'descending';
  onSortChange: (sortBy: number) => void;
};

export function SortButton({ buttonText, sortBy, active, sortDirection, onSortChange }: Props) {
  return (
    <button
      onClick={() => onSortChange(sortBy)}
      className={`sort-button py-1 lg:py-0 ${active ? 'sort-button--active' : ''} w-full flex gap-2 border-transparent ${active ? 'text-sapphire-500 !border-b-0' : '!border-b-1'} hover:underline cursor-pointer`}
      aria-label={`Sortera ${active ? (sortDirection === 'ascending' ? 'fallande' : 'stigande') : 'fallande'}`}
      aria-pressed={active}
      type="button"
    >
      {buttonText}
      <div className={`flex flex-col gap-[0.2rem] h-6 w-6 mt-1`}>
        <span
          className={
            !active || (active && sortDirection === 'descending') ? 'visible' : 'invisible'
          }
        >
          <DigiIconCaretUp />
        </span>
        <span
          className={!active || (active && sortDirection === 'ascending') ? 'visible' : 'invisible'}
        >
          <DigiIconCaretDown />
        </span>
      </div>
    </button>
  );
}
