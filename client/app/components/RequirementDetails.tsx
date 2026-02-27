import { ExpandableAccordionHeaderLevel, InfoCardHeadingLevel } from '@designsystem-se/af';
import { DigiExpandableAccordion, DigiInfoCard, DigiTypography } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import type { Requirement, RequirementAdditionsSetting } from '~/data/types';
import { envVars } from '~/helpers/helpers';

export type Props = {
  requirement: Requirement;
  headingLevel?: 'h2' | 'h3' | 'h4';
  textSuggestions?: string[];
};

export default function RequirementDetails({
  requirement,
  headingLevel = 'h4',
  textSuggestions = [],
}: Props) {
  const { t } = useTranslation();
  const requirementAdditions = envVars().requirementAdditions || {} as RequirementAdditionsSetting;

  const addition = requirementAdditions.items.find((item) => item.id === requirement.id);
  const HeadingTag = headingLevel;
  return (
    <DigiTypography>
      <div className="requirement-details flex flex-col xl:flex-row xl:gap-6 mb-4">
        <div className="mt-4">
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
        </div>
        <div className="mt-4">
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
          {textSuggestions && textSuggestions.length > 0 && (
            <DigiExpandableAccordion
              afHeading={t('RequirementForm.SuggestionsHeading')}
              afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
            >
              <ul>
                {textSuggestions.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </DigiExpandableAccordion>
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
      </div>
    </DigiTypography>
  );
}
