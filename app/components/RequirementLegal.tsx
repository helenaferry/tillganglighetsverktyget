import type { Requirement } from '~/data/types';

export type Props = {
  headingLevel?: 'h2' | 'h3' | 'h4';
  requirement: Requirement;
};

export default function RequirementLegal({ headingLevel = 'h4', requirement }: Props) {
  const HeadingTag = headingLevel;
  return (
    <>
      <HeadingTag className="!mt-4">Lagkrav och riktlinjer</HeadingTag>
      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        {requirement.en301549 &&
          requirement.en301549.length > 0 &&
          requirement.en301549.split(',').map((text, index) => (
            <div
              className="bg-grayscale-200 rounded-sm py-2 px-4"
              key={`en-${requirement.id}-${text.trim()}-${index}`}
            >
              {`EN ${text}`}
            </div>
          ))}
        {requirement.wcag &&
          requirement.wcag.length > 0 &&
          requirement.wcag.split(',').map((text, index) => (
            <div
              className="bg-grayscale-200 rounded-sm py-2 px-4"
              key={`wcag-${requirement.id}-${text.trim()}-${index}`}
            >
              {`WCAG ${text}`}
            </div>
          ))}
      </div>
    </>
  );
}
