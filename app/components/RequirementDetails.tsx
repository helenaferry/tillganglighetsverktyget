import { ExpandableAccordionHeaderLevel, InfoCardHeadingLevel } from '@designsystem-se/af';
import { DigiExpandableAccordion, DigiInfoCard, DigiTypography } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import type { Requirement, RequirementAdditionsSetting } from '~/data/types';

export type Props = {
  requirement: Requirement;
  headingLevel?: 'h2' | 'h3' | 'h4';
  twoCols?: boolean;
};

export default function RequirementDetails({
  requirement,
  headingLevel = 'h4',
  twoCols = false,
}: Props) {
  const { t } = useTranslation();
  const requirementAdditions = JSON.parse(
    import.meta.env.VITE_REQUIREMENT_ADDITIONS || '{}',
  ) as RequirementAdditionsSetting;

  const addition = requirementAdditions.items.find((item) => item.id === requirement.id);
  const HeadingTag = headingLevel;
  return (
    <DigiTypography>
      <div className={`requirement-details ${twoCols ? 'md:grid md:grid-cols-2 md:gap-6' : ''}`}>
        <div>
          {requirement.statement && (
            <div>
              <HeadingTag>{t('RequirementDetails.Description')}</HeadingTag>
              <div>
                <ReactMarkdown>{requirement.statement || ''}</ReactMarkdown>
              </div>
            </div>
          )}
          {requirement.why && (
            <div className="mt-4">
              <HeadingTag>{t('RequirementDetails.Why')}</HeadingTag>
              <div>
                <ReactMarkdown>{requirement.why || ''}</ReactMarkdown>
              </div>
            </div>
          )}
          {addition && (
            <div className="mt-4">
              <DigiInfoCard
                afHeading={requirementAdditions.heading}
                afHeadingLevel={
                  InfoCardHeadingLevel[
                    HeadingTag.toUpperCase() as keyof typeof ExpandableAccordionHeaderLevel
                  ]
                }
              >
                <div>
                  <ReactMarkdown>{addition?.text || ''}</ReactMarkdown>
                </div>
              </DigiInfoCard>
            </div>
          )}
        </div>
        {requirement.howToTest && (
          <DigiExpandableAccordion
            afHeading={t('RequirementDetails.HowToTest')}
            afHeadingLevel={
              ExpandableAccordionHeaderLevel[
                HeadingTag.toUpperCase() as keyof typeof ExpandableAccordionHeaderLevel
              ]
            }
          >
            <div>
              <ReactMarkdown>{requirement.howToTest || ''}</ReactMarkdown>
            </div>
          </DigiExpandableAccordion>
        )}
      </div>
    </DigiTypography>
  );
}
