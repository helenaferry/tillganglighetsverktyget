import { ButtonSize, ButtonVariation } from '@digi/arbetsformedlingen';
import { DigiButton, DigiIconArrowRight, DigiTypography } from '@digi/arbetsformedlingen-react';

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
    <>
      <a id="krav" />
      <div className="content-container content-container--white content-container--largest mb-8">
        <DigiTypography>
          <div className="absolute sm:hidden -left-2">
            <DigiButton
              afSize={ButtonSize.MEDIUM}
              afVariation={ButtonVariation.PRIMARY}
              afFullWidth={false}
              onAfOnClick={onToggleCategoryNav}
            >
              Kravkategorier
              <DigiIconArrowRight slot="icon-secondary" />
            </DigiButton>
          </div>
          <div className="pt-14 sm:pt-0">
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
        </DigiTypography>
      </div>
    </>
  );
}
