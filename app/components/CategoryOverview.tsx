import { DigiIconArrowRight, DigiTypography } from '@digi/arbetsformedlingen-react';

import { type Category } from '~/data/types';
import { numberChecked } from '~/helpers';

type Props = {
  category?: Category;
  onToggleCategoryNav: () => void;
};

export default function CategoryOverview({ category, onToggleCategoryNav }: Props) {
  if (!category) return null;
  const checkedCount = numberChecked(category.requirements);
  const totalCount = category?.requirements.length;
  const percentageChecked = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  return (
    <div className="content-container content-container--white content-container--largest mb-8">
      <DigiTypography>
        <div className="flex sm:block w-full">
          <div className="sm:hidden pr-4">
            <button
              className="h-full text-sapphire-500 font-bold hover:underline"
              onClick={onToggleCategoryNav}
            >
              <p className="w-[0.875rem] h-[0.875rem] flex items-center justify-center">
                <DigiIconArrowRight />
              </p>
              Kravkategorier
            </button>
          </div>
          <div className="border-l-1 border-grayscale-700 sm:border-0 pl-4 sm:pl-0">
            <h2>{category?.category}</h2>
            <strong>
              {checkedCount} av {totalCount} krav granskade i denna kategori
            </strong>
            <div className="relative h-[1rem] w-full mt-2 bg-grayscale-200 border-stratos-500 border-r-2">
              <div
                className="absolute top-0 left-0 h-[1rem] bg-stratos-500"
                style={{ width: `${percentageChecked}%` }}
              ></div>
            </div>
          </div>
        </div>
      </DigiTypography>
    </div>
  );
}
