import { ExpandableAccordionHeaderLevel } from '@digi/arbetsformedlingen';
import { DigiExpandableAccordion } from '@digi/arbetsformedlingen-react';
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
          <ReactMarkdown>{requirement.statement}</ReactMarkdown>
        </div>
      )}
      {requirement.why && (
        <div className="mt-4">
          <h4>Varför är detta viktigt?</h4>
          <ReactMarkdown>{requirement.why}</ReactMarkdown>
        </div>
      )}
      {addition && (
        <div className="mt-4">
          <h4>{requirementAdditions.heading}</h4>
          <ReactMarkdown>{addition?.text}</ReactMarkdown>
        </div>
      )}
      {requirement.howToTest && (
        <DigiExpandableAccordion
          afHeading="Hur du kan testa"
          afHeadingLevel={ExpandableAccordionHeaderLevel.H4}
        >
          <ReactMarkdown>{requirement.howToTest}</ReactMarkdown>
        </DigiExpandableAccordion>
      )}
    </div>
  );
}
