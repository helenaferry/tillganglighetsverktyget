import { DigiLayoutBlock, DigiTypography } from '@designsystem-se/af-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export function InfoCard() {
  const { t } = useTranslation();
  const location = useLocation();
  const [current, setCurrent] = useState(1);
  const [previous, setPrevious] = useState<number | null>(null);
  useEffect(() => {
    // Randomize number between 1-10, different from previous if possible (works for SPA nav of ReviewRequirement)
    let newValue = Math.floor(Math.random() * 10) + 1;
    while (previous !== null && newValue === previous) {
      newValue = Math.floor(Math.random() * 10) + 1;
    }
    setCurrent(newValue);
    setPrevious(newValue);
  }, [location]);
  return (
    <section className="min-h-[15rem] bg-white p-5">
      <DigiLayoutBlock>
        <DigiTypography>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
            <img
              src={t(`InfoCard.${current}.Image`)}
              alt=""
              className="w-[12rem] h-auto flex-shrink-0"
            />
            <div>
              <p aria-hidden="true" className="text-grayscale-700 !mb-0">
                {t('InfoCard.Heading')}
              </p>
              <h2 aria-label={`${t('InfoCard.Heading')} ${t(`InfoCard.${current}.Title`)}`}>
                {t(`InfoCard.${current}.Title`)}
              </h2>
              <p>{t(`InfoCard.${current}.Text`)}</p>
            </div>
          </div>
        </DigiTypography>
      </DigiLayoutBlock>
    </section>
  );
}
