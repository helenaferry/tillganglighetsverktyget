import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { type Requirement } from "~/data/types";
import {
    DigiTag,
} from "@digi/arbetsformedlingen-react";
import { TagSize } from "@digi/arbetsformedlingen";
import RequirementDetails from "./RequirementDetails";
import StatusBadge from "./StatusBadge";
import RequirementForm from "./RequirementForm";
import { useCheck } from '~/hooks/useReviewData';
import { StyledLink } from "./StyledLink";

type Props = {
    requirement: Requirement;
    reviewId: string;
    nextRequirementId: string | null;
    previousRequirementId: string | null;
};

export default function ReviewRequirement({ requirement, reviewId, nextRequirementId, previousRequirementId }: Props) {
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
        <div>
            <div className="flex justify-between mb-2">
                <div>
                    {previousRequirementId && (
                        <StyledLink to={`/review/${reviewId}/${previousRequirementId}`}
                            text="Föregående krav"
                            onClick={handleRequirementNav} />
                    )}
                </div>
                <div>
                    {nextRequirementId && (
                        <StyledLink to={`/review/${reviewId}/${nextRequirementId}`}
                            text="Nästa krav"
                            onClick={handleRequirementNav}
                        />
                    )}
                </div>
            </div>
            <section className="mb-8 p-6 rounded-md">
                <div className="border-b-1 md:flex gap-4 justify-between">
                    <div className="flex gap-4">
                        <div>
                            <h2>{requirement.id}. {requirement.name}</h2>
                            <div className="flex gap-2 mb-5">
                                <DigiTag
                                    afText={requirement.category}
                                    afSize={TagSize.SMALL}
                                    afNoIcon={true}
                                />
                                {requirement.en301459 && <DigiTag
                                    afText={requirement.en301459}
                                    afSize={TagSize.SMALL}
                                    afNoIcon={true}
                                />}
                                {requirement.wcag && <DigiTag
                                    afText={`WCAG ${requirement.wcag} ${requirement.wcagLevel}`}
                                    afSize={TagSize.SMALL}
                                    afNoIcon={true}
                                />}
                            </div>
                        </div>
                    </div>
                    <div>
                        {!isCheckLoading && <StatusBadge status={check?.status} />}
                    </div>
                </div>
                <div className="md:flex my-5 gap-5">
                    <RequirementDetails requirement={requirement} />
                    <div className="flex-1">
                        <RequirementForm
                            requirementId={requirement.id}
                            reviewId={reviewId}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
