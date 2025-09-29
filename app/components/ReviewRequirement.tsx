import { DigiTypography } from '@digi/arbetsformedlingen-react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { type Requirement } from '~/data/types';
import { useCheck } from '~/hooks/useReviewData';

import RequirementDetails from './RequirementDetails';
import RequirementForm from './RequirementForm';
import StatusBadge from './StatusBadge';
import { StyledLink } from './StyledLink';

type Props = {
  requirement: Requirement;
  reviewId: string;
  nextUnhandled: Requirement | undefined;
  previousUnhandled: Requirement | undefined;
};

export default function ReviewRequirement({
  requirement,
  reviewId,
  nextUnhandled,
  previousUnhandled,
}: Props) {
  const { check, isLoading: isCheckLoading } = useCheck(String(reviewId), String(requirement.id));

  const scrollPosRef = useRef<number>(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, scrollPosRef.current);
  }, [location]);

  const handleRequirementNav = () => {
    scrollPosRef.current = window.scrollY;
  };

  return (
    <div className="content-container content-container--white content-container--largest">
      <DigiTypography>
        <div>
          <div className="border-b-1 md:flex gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <h2>{requirement.name}</h2>
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
        <div className="flex flex-col md:flex:row justify-between mb-2">
          <div>
            {previousUnhandled && (
              <StyledLink
                to={`/granskning/${reviewId}/${previousUnhandled.id}`}
                text={`Föregående ogranskade krav: ${previousUnhandled.name}`}
                onClick={handleRequirementNav}
              />
            )}
          </div>
          <div>
            {nextUnhandled && (
              <StyledLink
                to={`/granskning/${reviewId}/${nextUnhandled.id}`}
                text={`Nästa ogranskade krav: ${nextUnhandled.name}`}
                onClick={handleRequirementNav}
              />
            )}
          </div>
        </div>
      </DigiTypography>
    </div>
  );
}
