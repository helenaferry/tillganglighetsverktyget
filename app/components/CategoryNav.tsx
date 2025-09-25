import { Status, type Category } from '~/data/types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DigiIconCheck, DigiTypography } from '@digi/arbetsformedlingen-react';

type Props = {
  reviewId: string;
  categories: Category[];
  selectedCategory: string;
  selectedRequirement: string;
  showCategoryNav: boolean;
  onToggleNav: () => void;
  onSelectCategory?: () => void;
};
const activeColor = 'var(--digi--stratos-500)';
const tagBgColor = 'var(--digi--grayscale-200)';
const NumberOrChecked = ({
  number,
  checked,
  active,
}: {
  number: number;
  checked: boolean;
  active: boolean;
}) => {
  const bgColor = active ? 'white' : checked ? activeColor : tagBgColor;
  return (
    <div
      className={`flex items-center justify-center text-center w-[2rem] h-[2rem] rounded-full`}
      style={{ backgroundColor: bgColor }}
    >
      {checked ? (
        <DigiIconCheck
          style={
            {
              '--digi--icon--color': active ? activeColor : '#fff',
              '--digi--icon--width': '0.875rem',
            } as React.CSSProperties
          }
        />
      ) : (
        <span>{number}</span>
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
  onSelectCategory,
}: Props) {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([selectedCategory]);

  const selectCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category],
    );
    const activeCategory = categories.find((cat) => cat.category === category);
    if (activeCategory) {
      const firstRequirement = activeCategory.requirements[0];
      if (firstRequirement) {
        navigate(`/granskning/${reviewId}/${firstRequirement.id}`);
      }
    }
    onSelectCategory?.();
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

    return (
      <span
        className={`inline-block
        ${tagBgColor}
        rounded-[var(--digi--border-radius--complementary-2)] 
        py-[var(--digi--padding--smaller)] 
        px-[var(--digi--padding--small)]
        mt-2`}
      >{`${checked}/${requirements.length}`}</span>
    );
  };

  return (
    <nav
      className={`h-screen max-h-screen pb-[100vh] overflow-y-scroll bg-white ${showCategoryNav ? 'w-screen sm:w-[25rem]' : 'w-[4rem] float-left'} `}
    >
      <DigiTypography>
        <div className="flex justify-between">
          {showCategoryNav && <h3>Kravkategorier</h3>}
          <button onClick={onToggleNav}>{showCategoryNav ? 'Fäll in' : 'Fäll ut'}</button>
        </div>
        <ul className={showCategoryNav ? '' : 'hidden'}>
          {categories.map((category) => (
            <li
              key={category.category}
              className="border-[var(--digi--grayscale-100)] border-b first:border-t p-3"
            >
              <button
                onClick={() => selectCategory(category.category)}
                aria-controls={category.category}
                className="flex justify-between w-full text-left"
              >
                <div>
                  <div>{category.category}</div>
                  <div className="mb-0">{getCategoryStatus(category.category)}</div>
                </div>
                <div>{expandedCategories.includes(category.category) ? '-' : '+'}</div>
              </button>
              <ul
                id={category.category}
                style={{
                  display: expandedCategories.includes(category.category) ? 'block' : 'none',
                }}
              >
                {category.requirements.map((req, i) => {
                  const done =
                    req.check?.status === Status.PASS ||
                    req.check?.status === Status.FAIL ||
                    req.check?.status === Status.IRRELEVANT;
                  const selected = selectedRequirement === req.id;
                  return (
                    <li key={req.id}>
                      <button
                        onClick={() => navigate(`/granskning/${reviewId}/${req.id}`)}
                        className={`w-full grid grid-cols-[2rem_1fr] gap-2 justify-center p-[0.75rem] group rounded-[0.5rem] 
                        bg-[${selected ? activeColor : 'white'}]`}
                      >
                        <div className="h-full flex items-center">
                          <NumberOrChecked number={i + 1} checked={done} active={selected} />
                        </div>
                        <div
                          className={`text-left group-hover:underline ${selected ? 'text-white' : ''} ${req.check?.status === Status.IRRELEVANT ? 'line-through' : ''}`}
                        >
                          {req.name}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </DigiTypography>
    </nav>
  );
}
