import { DigiTypography } from '@digi/arbetsformedlingen-react';

import { type Category } from '~/data/types';
import { numberChecked } from '~/helpers';

type Props = {
  category?: Category;
};

export default function CategoryOverview({ category }: Props) {
  if (!category) return null;
  const checkedCount = numberChecked(category.requirements);
  const totalCount = category?.requirements.length;
  const percentageChecked = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  return (
    <div className="content-container content-container--white content-container--largest mb-8">
      <DigiTypography>
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
      </DigiTypography>
    </div>
  );
}
