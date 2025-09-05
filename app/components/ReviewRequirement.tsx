import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Status, type FullReview, type RequirementWithCheck, type UpsertCheckInput } from "~/data/types";
import {
    DigiTag,
} from "@digi/arbetsformedlingen-react";
import { TagSize } from "@digi/arbetsformedlingen";
import { StyledLink } from "./StyledLink";
import RequirementDetails from "./RequirementDetails";
import StatusBadge from "./StatusBadge";
import RequirementForm from "./RequirementForm";
import { useCheck } from '~/hooks/useReviewData';

type Props = {
    requirement: RequirementWithCheck;
    review: FullReview;
    hideIrrelevant: boolean;
};

export default function ReviewRequirement({ requirement, review, hideIrrelevant }: Props) {
    const { check } = useCheck(String(review.id), String(requirement.id));

    const scrollPosRef = useRef<number>(0);
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, scrollPosRef.current);
    }, [location]);

    const handleRequirementNav = () => {
        scrollPosRef.current = window.scrollY;
    };

    const relevantRequirements = useMemo(() => {
        if (!requirement) return [];
        return review.requirements.filter((req: RequirementWithCheck) => !hideIrrelevant || req.check?.status !== Status.IRRELEVANT);
    }, [requirement, review, hideIrrelevant]);

    const nextRequirementId = useMemo(() => {
        const currentIndex = relevantRequirements.findIndex((req: RequirementWithCheck) => req.id === requirement.id);
        return relevantRequirements[currentIndex + 1]?.id || null;
    }, [requirement, relevantRequirements]);

    const previousRequirementId = useMemo(() => {
        const currentIndex = relevantRequirements.findIndex((req: RequirementWithCheck) => req.id === requirement.id);
        return relevantRequirements[currentIndex - 1]?.id || null;
    }, [requirement, relevantRequirements]);

    return (
        <div>
            <div className="flex justify-between mb-2">
                <div>
                    {previousRequirementId && (
                        <StyledLink to={`/review/${review.id}/${previousRequirementId}`}
                            text="Föregående krav"
                            onClick={handleRequirementNav} />
                    )}
                </div>
                <div>
                    {nextRequirementId && (
                        <StyledLink to={`/review/${review.id}/${nextRequirementId}`}
                            text="Nästa krav"
                            onClick={handleRequirementNav}
                        />
                    )}
                </div>
            </div>
            <section className="mb-8 p-6 rounded-md">
                <div className="border-b-1 md:flex gap-4 justify-between">
                    <div className="flex gap-4">
                        <h2>{requirement.id}. {requirement.topic}</h2>
                        <div className="flex gap-2 mb-5">
                            <DigiTag
                                afText={requirement.category}
                                afSize={TagSize.SMALL}
                                afNoIcon={true}
                            />
                            <DigiTag
                                afText={requirement.role}
                                afSize={TagSize.SMALL}
                                afNoIcon={true}
                            />
                            <DigiTag
                                afText={requirement.level}
                                afSize={TagSize.SMALL}
                                afNoIcon={true}
                            />
                        </div>
                    </div>
                    <div>
                        <StatusBadge key={requirement.id} status={check?.status} />
                    </div>
                </div>
                <div className="md:flex my-5 gap-5">
                    <RequirementDetails requirement={requirement} />
                    <div className="flex-1">
                        <RequirementForm
                            key={requirement.id}
                            requirement={requirement}
                            reviewId={review.id}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
