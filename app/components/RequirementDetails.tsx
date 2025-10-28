import { ExpandableAccordionHeaderLevel } from '@designsystem-se/af';
import { DigiExpandableAccordion } from '@designsystem-se/af-react';
import ReactMarkdown from 'react-markdown';

import type { Requirement, RequirementAdditionsSetting } from '~/data/types';

export type Props = {
  requirement: Requirement;
};

export default function RequirementDetails({ requirement }: Props) {
  const requirementAdditions = JSON.parse(
    import.meta.env.VITE_REQUIREMENT_ADDITIONS || '{}',
  ) as RequirementAdditionsSetting;

  const addition = requirementAdditions.items.find((item) => item.id === requirement.id);

  return (
    <div>
      {requirement.statement && (
        <div>
          <h4>Beskrivning</h4>
          <div>
            <ReactMarkdown>{requirement.statement || ''}</ReactMarkdown>
          </div>
        </div>
      )}
      {requirement.why && (
        <div className="mt-4">
          <h4>Varför är detta viktigt?</h4>
          <div>
            <ReactMarkdown>{requirement.why || ''}</ReactMarkdown>
          </div>
        </div>
      )}
      {addition && (
        <div className="mt-4">
          <h4>{requirementAdditions.heading}</h4>
          <div>
            <ReactMarkdown>{addition?.text || ''}</ReactMarkdown>
          </div>
        </div>
      )}
      {requirement.howToTest && (
        <DigiExpandableAccordion
          afHeading="Hur du kan testa"
          afHeadingLevel={ExpandableAccordionHeaderLevel.H4}
        >
          <div>
            <ReactMarkdown>{requirement.howToTest || ''}</ReactMarkdown>
          </div>
        </DigiExpandableAccordion>
      )}
    </div>
  );
}
