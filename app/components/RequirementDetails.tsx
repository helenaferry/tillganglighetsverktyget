import { ExpandableAccordionHeaderLevel } from '@digi/arbetsformedlingen';
import { DigiExpandableAccordion } from '@digi/arbetsformedlingen-react';
import type { Requirement } from '~/data/types';
import ReactMarkdown from 'react-markdown';

export type Props = {
  requirement: Requirement;
};

export default function RequirementDetails({ requirement }: Props) {
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
      {requirement.howToTestContent && (
        <DigiExpandableAccordion
          afHeading="Hur du kan testa"
          afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
        >
          <ReactMarkdown>{requirement.howToTestContent}</ReactMarkdown>
        </DigiExpandableAccordion>
      )}
    </div>
  );
}
