import { ExpandableAccordionHeaderLevel } from '@designsystem-se/af';
import { DigiExpandableAccordion, DigiTypography } from '@designsystem-se/af-react';
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
  const requirementAdditions = JSON.parse(
    import.meta.env.VITE_REQUIREMENT_ADDITIONS || '{}',
  ) as RequirementAdditionsSetting;

  const addition = requirementAdditions.items.find((item) => item.id === requirement.id);
  const HeadingTag = headingLevel;
  return (
    <DigiTypography>
      <div className={twoCols ? 'md:grid md:grid-cols-2 md:gap-6' : ''}>
        <div>
          {requirement.statement && (
            <div>
              <HeadingTag>Beskrivning</HeadingTag>
              <div>
                <ReactMarkdown>{requirement.statement || ''}</ReactMarkdown>
              </div>
            </div>
          )}
          {requirement.why && (
            <div className="mt-4">
              <HeadingTag>Varför är detta viktigt?</HeadingTag>
              <div>
                <ReactMarkdown>{requirement.why || ''}</ReactMarkdown>
              </div>
            </div>
          )}
          {addition && (
            <div className="mt-4">
              <HeadingTag>{requirementAdditions.heading}</HeadingTag>
              <div>
                <ReactMarkdown>{addition?.text || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        {requirement.howToTest && (
          <DigiExpandableAccordion
            afHeading="Hur du kan testa"
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
