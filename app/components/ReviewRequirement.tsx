import { DigiTypography } from '@digi/arbetsformedlingen-react';

import { type Requirement } from '~/data/types';
import { useCheck } from '~/hooks/useReviewData';

import RequirementDetails from './RequirementDetails';
import RequirementForm from './RequirementForm';
import StatusBadge from './StatusBadge';

type Props = {
  requirement: Requirement;
  reviewId: string;
  numberInCategory: number;
  totalInCategory: number;
};

export default function ReviewRequirement({
  requirement,
  reviewId,
  numberInCategory,
  totalInCategory,
}: Props) {
  const { check, isLoading: isCheckLoading } = useCheck(String(reviewId), String(requirement.id));

  return (
    <div className="content-container content-container--white content-container--largest">
      <DigiTypography>
        <div>
          <div className="border-b-1 md:flex gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <p className="text-grayscale-700">
                  Krav {numberInCategory} av {totalInCategory}
                </p>
                <h3>{requirement.name}</h3>
                <div className="flex gap-2">
                  <div>
                    <strong>EN</strong>
                    {requirement.en301549 &&
                      requirement.en301549.length > 0 &&
                      requirement.en301549
                        .split(',')
                        .map((text, index) => (
                          <div
                            className="bg-grayscale-200 rounded-sm my-2 py-2 px-4"
                            key={index}
                          >{`${text}`}</div>
                        ))}
                  </div>
                  <div>
                    <strong>WCAG</strong>
                    {requirement.wcag &&
                      requirement.wcag.length > 0 &&
                      requirement.wcag
                        .split(',')
                        .map((text, index) => (
                          <div
                            className="bg-grayscale-200 rounded-sm my-2 py-2 px-4"
                            key={index}
                          >{`${text}`}</div>
                        ))}
                  </div>
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
