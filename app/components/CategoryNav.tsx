import { ButtonSize, ButtonVariation } from '@digi/arbetsformedlingen';
import {
  DigiButton,
  DigiIconCheck,
  DigiIconMinus,
  DigiIconPlus,
  DigiIconX,
  DigiTypography,
} from '@digi/arbetsformedlingen-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type Category, Status } from '~/data/types';

type Props = {
  reviewId: string;
  categories: Category[];
  selectedCategory: string;
  selectedRequirement: string;
  showCategoryNav: boolean;
  onToggleNav: () => void;
};
const StatusIndicator = ({ checked, active }: { checked: boolean; active: boolean }) => {
  return (
    <div
      className={`flex items-center justify-center text-center w-[1.5rem] h-[1.5rem] p-[0.2rem] rounded-full border border-2 border-dashed
        ${!active && !checked ? 'border-grayscale-700' : ''}
        ${active && checked ? 'bg-white border-transparent' : ''}
        ${!active && checked ? 'bg-stratos-500 border-transparent' : ''}
        ${active && !checked ? 'bg-stratos-500 border-white' : ''}
        `}
    >
      {checked ? (
        <DigiIconCheck
          style={
            {
              '--digi--icon--color': active ? '--digi--stratos-500' : 'white',
            } as React.CSSProperties
          }
        />
      ) : (
        <span></span>
      )}
    </div>
  );
};

export default function CategoryNav({
  reviewId,
  categories,
  selectedCategory,
  selectedRequirement,
  showCategoryNav,
  onToggleNav,
}: Props) {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([selectedCategory]);

  useEffect(() => {
    if (selectedCategory && !expandedCategories.includes(selectedCategory)) {
      setExpandedCategories([selectedCategory]);
    }
  }, [selectedCategory]);

  const selectCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category],
    );
  };
  const getCategoryStatus = (category: string) => {
    const requirements = categories.find((cat) => cat.category === category)?.requirements;
    if (!requirements) return '';
    const checked = requirements.filter(
      (req) =>
        req.check?.status === Status.PASS ||
        req.check?.status === Status.FAIL ||
        req.check?.status === Status.IRRELEVANT,
    ).length;
    const done = checked === requirements.length;
    return (
      <span
        className={`inline-block border border-2 border-dashed
        ${done ? 'bg-stratos-500 text-white border-transparent' : 'bg-white border-grayscale-700'}
        rounded-[var(--digi--border-radius--complementary-2)] 
        py-[0.1875rem] 
        px-[0.6875rem]
        mt-2`}
      >{`${checked}/${requirements.length}`}</span>
    );
  };

  return (
    <nav>
      <DigiTypography>
        <div className="flex justify-between pt-5 px-5">
          {showCategoryNav && <h2>Kravkategorier</h2>}
          <DigiButton
            className="block sm:hidden"
            afSize={ButtonSize.SMALL}
            afVariation={ButtonVariation.FUNCTION}
            onAfOnClick={onToggleNav}
          >
            Stäng
            <DigiIconX slot="icon-secondary" />
          </DigiButton>
        </div>
        <ul className={`px-2 py-2 ${showCategoryNav ? '' : 'hidden'} sm:block`}>
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.category);
            return (
              <li
                key={category.category}
                className="border-grayscale-100 border-b first:border-t p-3"
              >
                <button
                  type="button"
                  onClick={() => selectCategory(category.category)}
                  aria-controls={category.category}
                  aria-expanded={isExpanded}
                  className="expand-category group flex justify-between w-full text-left py-1"
                >
                  <div>
                    <div
                      className={`pr-1 group-hover:underline ${isExpanded ? 'font-semibold' : ''}`}
                    >
                      {category.category}
                    </div>
                    <div className="mb-0">{getCategoryStatus(category.category)}</div>
                  </div>
                  <div>
                    {isExpanded ? (
                      <div className="flex items-center justify-center w-[1.25rem] h-[1.25rem] bg-leaf-200 group-hover:bg-stratos-500 p-[0.2rem] rounded-full">
                        <DigiIconMinus />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-[1.25rem] h-[1.25rem] bg-grayscale-200 group-hover:bg-stratos-500 p-[0.2rem] rounded-full">
                        <DigiIconPlus />
                      </div>
                    )}
                  </div>
                </button>
                <ul
                  id={category.category}
                  className="pt-2"
                  style={{
                    display: isExpanded ? 'block' : 'none',
                  }}
                >
                  {category.requirements.map((req) => {
                    const done =
                      req.check?.status === Status.PASS ||
                      req.check?.status === Status.FAIL ||
                      req.check?.status === Status.IRRELEVANT;
                    const selected = selectedRequirement === req.id;
                    return (
                      <li key={req.id}>
                        <a
                          href={`/granskning/${reviewId}/${req.id}/#requirement-top`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/granskning/${reviewId}/${req.id}/#requirement-top`);
                          }}
                          className={`w-full grid grid-cols-[2rem_1fr] gap-2 justify-center p-[0.75rem] group rounded-[0.5rem] !no-underline visited:!text-text
                        bg-${selected ? 'stratos-500' : 'white'}`}
                        >
                          <div className="h-full flex items-center">
                            <StatusIndicator checked={done} active={selected} />
                          </div>
                          <div
                            className={`text-left no-underline hover:underline text-text ${selected ? 'text-white font-bold' : ''} ${req.check?.status === Status.IRRELEVANT ? 'line-through' : ''}`}
                          >
                            {req.name}
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </DigiTypography>
    </nav>
  );
}
