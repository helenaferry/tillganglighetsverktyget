import { TypographyHeadingJumboLevel, TypographyHeadingJumboVariation } from '@designsystem-se/af';
import { DigiTypography, DigiTypographyHeadingJumbo } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import Process from '~/components/Process';
import i18n from '~/lang/i18n';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || i18n.t('start.defaultAppTitle');

export function meta() {
  return [
    { title: `${applicationTitle}: ${i18n.t('tips.Title')}` },
    { name: 'description', content: i18n.t('tips.MetaDescription') },
  ];
}

export default function TipsPage() {
  const { t } = useTranslation();
  return (
    <DigiTypography>
      <div className="content-container content-container--white content-container--nomargin">
        <div className="content-container content-container--largest content-container--nomargin content-container--nopadding">
          <DigiTypographyHeadingJumbo
            afText={t('tips.Title')}
            afLevel={TypographyHeadingJumboLevel.H1}
            afVariation={TypographyHeadingJumboVariation.PRIMARY}
          ></DigiTypographyHeadingJumbo>
          <p className="!font-semibold">{t('tips.Preamble')}</p>
          <h2>Så här går en granskning till</h2>
          <p>En övergripande process hur en granskning fungerar.</p>
          <Process subHeadingElement="h3" showDescription={true} />
        </div>
      </div>
    </DigiTypography>
  );
}
