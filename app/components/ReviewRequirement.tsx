import { DigiTypography } from '@digi/arbetsformedlingen-react';

import { type Requirement } from '~/data/types';
import { useCheck } from '~/hooks/useReviewData';

import RequirementDetails from './RequirementDetails';
import RequirementForm from './RequirementForm';
import StatusBadge from './StatusBadge';

type Props = {
  requirement: Requirement;
  reviewId: string;
};

export default function ReviewRequirement({ requirement, reviewId }: Props) {
  const { check, isLoading: isCheckLoading } = useCheck(String(reviewId), String(requirement.id));

  return (
    <div className="content-container content-container--white content-container--largest">
      <DigiTypography>
        <div>
          <div className="border-b-1 md:flex gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <h3>{requirement.name}</h3>
                <div>
                  <span>{requirement.category}</span>
                  <br />
                  {requirement.en301549 &&
                    requirement.en301549.length > 0 &&
                    requirement.en301549
                      .split(',')
                      .map((text, index) => <span key={index}>{`EN ${text}`}</span>)}
                  <br />
                  {requirement.wcag &&
                    requirement.wcag.length > 0 &&
                    requirement.wcag
                      .split(',')
                      .map((text, index) => (
                        <span key={index}>{`WCAG ${text} (${requirement.wcagLevel})`}</span>
                      ))}
                </div>
              </div>
            </div>
            <div>{!isCheckLoading && <StatusBadge status={check?.status} />}</div>
          </div>
          <div className="md:flex my-5 gap-5">
            <div className="flex-1">
              <RequirementDetails requirement={requirement} />
            </div>
            <div className="flex-1">
              <RequirementForm requirementId={requirement.id} reviewId={reviewId} />
            </div>
          </div>
        </div>
      </DigiTypography>
    </div>
  );
}
