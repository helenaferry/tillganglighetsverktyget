import { ExpandableAccordionHeaderLevel } from '@digi/arbetsformedlingen';
import { DigiExpandableAccordion } from '@digi/arbetsformedlingen-react';
import type { Requirement, RequirementAdditionsSetting } from '~/data/types';
import ReactMarkdown from 'react-markdown';

export type Props = {
  requirement: Requirement;
};

export default function RequirementDetails({ requirement }: Props) {
  const requirementAdditions = JSON.parse(
    import.meta.env.VITE_REQUIREMENT_ADDITIONS || '{}',
  ) as RequirementAdditionsSetting;
  return (
    <div>
      {requirement.statement && (
        <div>
          <h3>Beskrivning</h3>
          <ReactMarkdown>{requirement.statement}</ReactMarkdown>
        </div>
      )}
      {requirement.why && (
        <div className="mt-4">
          <h3>Varför är detta viktigt?</h3>
          <ReactMarkdown>{requirement.why}</ReactMarkdown>
        </div>
      )}
      {requirementAdditions.items.find((item) => item.id === requirement.id) && (
        <div className="mt-4">
          <h3>{requirementAdditions.heading}</h3>
          <ReactMarkdown>
            {requirementAdditions.items.find((item) => item.id === requirement.id)?.text || ''}
          </ReactMarkdown>
        </div>
      )}
      {requirement.howToTest && (
        <DigiExpandableAccordion
          afHeading="Hur du kan testa"
          afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
        >
          <ReactMarkdown>{requirement.howToTest}</ReactMarkdown>
        </DigiExpandableAccordion>
      )}
    </div>
  );
}
