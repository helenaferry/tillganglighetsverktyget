import { DigiIconChevronDown, DigiIconChevronRight } from '@designsystem-se/af-react';
import type { JSX } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useTranslation } from 'react-i18next';

type Props = {
  showHeading?: boolean;
  subHeadingElement: string;
  showDescription: boolean;
};

export default function Process({
  showHeading = false,
  subHeadingElement: headingElement,
  showDescription,
}: Props) {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('Process.Step1Title'),
      description: t('Process.Step1Description'),
      imgSrc: '/process-step-1.svg',
    },
    {
      title: t('Process.Step2Title'),
      description: t('Process.Step2Description'),
      imgSrc: '/process-step-2.svg',
    },
    {
      title: t('Process.Step3Title'),
      description: t('Process.Step3Description'),
      imgSrc: '/process-step-3.svg',
    },
    {
      title: t('Process.Step4Title'),
      description: t('Process.Step4Description'),
      imgSrc: '/process-step-4.svg',
    },
  ];

  const HeadingTag = headingElement as keyof JSX.IntrinsicElements;

  return (
    <>
      {showHeading && <h2>{t('Process.Heading')}</h2>}
      <div role="list" className="flex gap-6 flex-wrap md:flex-nowrap mb-6 md:mb-0">
        {steps.map((step, index) => {
          return (
            <div
              key={index}
              role="listitem"
              className="flex gap-2 flex-row md:flex-col basis-1/1 md:basis-1/4 shrink items-center md:items-start"
            >
              <div aria-hidden="true" className="flex min-w-0 md:w-full gap-5">
                <img src={step.imgSrc} alt="" className="w-18 md:w-24 lg:w-18 xl:w-24 h-auto" />
                {/* Arrow horizontal, md and up */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex rotate-0 basis-[3rem] shrink items-center justify-stretch">
                    <hr className="border-t-2 border-grayscale-900 w-full max-w-[10rem] relative left-[0.35rem] bottom-[0.02rem]" />
                    <DigiIconChevronRight />
                  </div>
                )}
                {/* Arrow vertical, below md */}
                <div className="md:hidden">
                  <div className="h-full w-5 relative -top-3">
                    <div className="w-1 h-full border-r-2 border-grayscale-900 relative left-[0.26rem] top-[0.8rem]" />
                    <DigiIconChevronDown />
                  </div>
                </div>
              </div>
              <div className="basis-1/2 shrink">
                <HeadingTag>{step.title}</HeadingTag>
                {showDescription && (
                  <p className="block max-w-full wrap-break-word hyphens-auto">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
