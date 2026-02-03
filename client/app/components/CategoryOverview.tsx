import { ButtonSize, ButtonVariation } from '@designsystem-se/af';
import {
  DigiButton,
  DigiIconArrowRight,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import { type Category } from '~/data/types';
import { numberChecked } from '~/helpers/helpers';

import ProgressBar from './ProgressBar';

type Props = {
  category?: Category;
  isCategoryNavOpen: boolean;
  onToggleCategoryNav: () => void;
};

export default function CategoryOverview({
  category,
  isCategoryNavOpen,
  onToggleCategoryNav,
}: Props) {
  const { t } = useTranslation();
  if (!category) return null;
  const checkedCount = numberChecked(category.requirements);
  const totalCount = category?.requirements.length;
  const percentageChecked = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  return (
    <DigiLayoutContainer afNoGutter={true}>
      <DigiLayoutBlock afVerticalPadding={true}>
        <div className="" id="krav">
          <DigiTypography>
            <div
              className={`absolute md:hidden transition-all duration-500 ${isCategoryNavOpen ? 'left-0' : '-left-2'}`}
            >
              <DigiButton
                afId="toggle-category-nav"
                afSize={ButtonSize.MEDIUM}
                afVariation={ButtonVariation.PRIMARY}
                afFullWidth={false}
                onAfOnClick={onToggleCategoryNav}
                afAriaControls="category-nav"
                afAriaExpanded={isCategoryNavOpen}
              >
                {t('CategoryOverview.ToggleCategoryNav')}
                <DigiIconArrowRight slot="icon-secondary" />
              </DigiButton>
            </div>

            <div className="pt-14 md:pt-0">
              <ProgressBar
                progress={percentageChecked}
                text={t('CategoryOverview.ProgressText', {
                  category: category?.category,
                  checked: checkedCount,
                  total: totalCount,
                })}
              />
            </div>
          </DigiTypography>
        </div>
      </DigiLayoutBlock>
    </DigiLayoutContainer>
  );
}
