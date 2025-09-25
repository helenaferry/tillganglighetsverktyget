import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { type Requirement } from '~/data/types';
import { DigiTypography } from '@digi/arbetsformedlingen-react';
import RequirementDetails from './RequirementDetails';
import StatusBadge from './StatusBadge';
import RequirementForm from './RequirementForm';
import { useCheck } from '~/hooks/useReviewData';
import { StyledLink } from './StyledLink';

type Props = {
  requirement: Requirement;
  reviewId: string;
  nextRequirementId: string | null;
  previousRequirementId: string | null;
};

export default function ReviewRequirement({
  requirement,
  reviewId,
  nextRequirementId,
  previousRequirementId,
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
        {/* TODO Fix links */}
        <div className="hidden flex flex-col md:flex:row justify-between mb-2">
          <div>
            {previousRequirementId && (
              <StyledLink
                to={`/granskning/${reviewId}/${previousRequirementId}`}
                text="Föregående krav"
                onClick={handleRequirementNav}
              />
            )}
          </div>
          <div>
            {nextRequirementId && (
              <StyledLink
                to={`/granskning/${reviewId}/${nextRequirementId}`}
                text="Nästa krav"
                onClick={handleRequirementNav}
              />
            )}
          </div>
        </div>
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
      </DigiTypography>
    </div>
  );
}
