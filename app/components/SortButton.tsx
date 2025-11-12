import { ButtonVariation } from '@designsystem-se/af';
import {
  DigiButton,
  DigiIconCaretDown,
  DigiIconCaretUp,
  DigiIconSort,
} from '@designsystem-se/af-react';

type Props = {
  buttonText: string;
  sortBy: number;
  active?: boolean;
  sortDirection: 'stigande' | 'fallande';
  onSortChange: (sortBy: number) => void;
};

export function SortButton({ buttonText, sortBy, active, sortDirection, onSortChange }: Props) {
  return (
    <>
      {/* Desktop has plain button element */}
      <button
        type="button"
        className={`sort-button hidden lg:flex py-1 lg:py-0 ${active ? 'sort-button--active' : ''} w-full gap-2 border-transparent ${active ? 'text-sapphire-500 !border-b-0' : '!border-b-1'} hover:underline cursor-pointer`}
        aria-label={`${buttonText} - Sortera ${active ? (sortDirection === 'stigande' ? 'fallande' : 'stigande') : 'fallande'}`}
        aria-pressed={active}
        onClick={() => onSortChange(sortBy)}
      >
        {buttonText}
        <div className={`flex flex-col gap-[0.2rem] h-6 w-6 mt-1`}>
          <span
            className={
              !active || (active && sortDirection === 'fallande') ? 'visible' : 'invisible'
            }
          >
            <DigiIconCaretUp />
          </span>
          <span
            className={
              !active || (active && sortDirection === 'stigande') ? 'visible' : 'invisible'
            }
          >
            <DigiIconCaretDown />
          </span>
        </div>
      </button>

      {/* Mobile has DigiButton component */}
      <span className="lg:hidden">
        <DigiButton
          afVariation={active ? ButtonVariation.PRIMARY : ButtonVariation.SECONDARY}
          afType="button"
          afAriaLabel={`${buttonText} - Sortera ${active ? (sortDirection === 'stigande' ? 'fallande' : 'stigande') : 'fallande'}`}
          afAriaPressed={active}
          onAfOnClick={() => onSortChange(sortBy)}
        >
          {buttonText}
          <span
            className={`${active ? 'mobile-sort-icon--active' : 'mobile-sort-icon'}`}
            slot="icon-secondary"
          >
            {!active && <DigiIconSort />}
            {active && sortDirection === 'stigande' && <DigiIconCaretUp />}
            {active && sortDirection === 'fallande' && <DigiIconCaretDown />}
          </span>
        </DigiButton>
      </span>
    </>
  );
}
