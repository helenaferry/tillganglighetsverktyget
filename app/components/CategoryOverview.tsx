import { ButtonSize, ButtonVariation } from '@designsystem-se/af';
import { DigiButton, DigiIconArrowRight, DigiTypography } from '@designsystem-se/af-react';

import { type Category } from '~/data/types';
import { numberChecked } from '~/helpers';

import ProgressBar from './ProgressBar';

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
    <div>
      <div
        className="content-container content-container--white content-container--largest mb-8"
        id="krav"
      >
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
            <ProgressBar
              progress={percentageChecked}
              text={`${checkedCount} av ${totalCount} krav granskade i denna kategori`}
            />
          </div>
        </DigiTypography>
      </div>
    </div>
  );
}
