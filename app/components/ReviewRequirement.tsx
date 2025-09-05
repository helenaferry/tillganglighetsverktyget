import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { FullReview, RequirementWithCheck, UpsertCheckInput } from "~/data/types";
import {
    DigiFormRadiogroup,
    DigiFormRadiobutton,
    DigiFormTextarea,
    DigiTag,
} from "@digi/arbetsformedlingen-react";
import { FormTextareaVariation, TagSize } from "@digi/arbetsformedlingen";
import { useUpsertCheck, useDeleteCheck } from '~/hooks/useReviewData'
import { StyledLink } from "./StyledLink";
import RequirementDetails from "./RequirementDetails";
import StatusBadge from "./StatusBadge";

type Props = {
    requirement: RequirementWithCheck;
    review: FullReview;
    hideIrrelevant: boolean;
};

export default function ReviewRequirement({ requirement, review, hideIrrelevant }: Props) {
    const upsertCheck = useUpsertCheck();
    const deleteCheck = useDeleteCheck();

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
        return review.requirements.filter(req => !hideIrrelevant || req.check?.status !== 'irrelevant');
    }, [requirement, review, hideIrrelevant]);

    const nextRequirementId = useMemo(() => {
        const currentIndex = relevantRequirements.findIndex(req => req.id === requirement.id);
        return relevantRequirements[currentIndex + 1]?.id || null;
    }, [requirement, relevantRequirements]);

    const previousRequirementId = useMemo(() => {
        const currentIndex = relevantRequirements.findIndex(req => req.id === requirement.id);
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
                        <StatusBadge status={requirement.check?.status} />
                    </div>
                </div>
                <div className="md:flex my-5 gap-5">
                    <RequirementDetails requirement={requirement} />
                    <div className="flex-1">
                        <form id="requirement-form">
                            <DigiFormRadiogroup afName="fulfillment"
                                onAfOnGroupChange={(e: CustomEvent) => {
                                    const status = e.detail.target.value;
                                    if (!status && requirement.check) {
                                        deleteCheck.mutate(requirement.id);
                                    }
                                    const input: UpsertCheckInput = {
                                        reviewId: review.id,
                                        requirement: requirement.id,
                                        status: status,
                                        comment: requirement.check?.comment ?? "",
                                    };
                                    upsertCheck.mutate(input, {
                                        onError: (err) => {
                                            console.error("Could not save check:", err);
                                        },
                                    });
                                }}>
                                <DigiFormRadiobutton
                                    value=""
                                    afLabel="Kravet är ej bedömt"
                                    afChecked={!requirement.check} />
                                <DigiFormRadiobutton
                                    value="pass"
                                    afLabel="Kravet uppfylls"
                                    afChecked={requirement.check?.status === 'pass'}
                                />
                                <DigiFormRadiobutton
                                    value="fail"
                                    afLabel="Kravet uppfylls inte"
                                    afChecked={requirement.check?.status === 'fail'}
                                />
                                <DigiFormRadiobutton
                                    value="irrelevant"
                                    afLabel="Kravet är ej relevant"
                                    afChecked={requirement.check?.status === 'irrelevant'}
                                />
                            </DigiFormRadiogroup>
                            {upsertCheck.isError ? "Fel vid sparande" : ""}
                            {requirement.check?.status &&
                                <DigiFormTextarea
                                    afValue={requirement.check?.comment ?? ""}
                                    afLabel={`Kommentar för krav: ${requirement.topic}`}
                                    afVariation={FormTextareaVariation.LARGE}
                                    onChange={(event) => {
                                        const input: UpsertCheckInput = {
                                            reviewId: review.id,
                                            requirement: requirement.id,
                                            status: (requirement.check?.status === 'pass' || requirement.check?.status === 'fail' || requirement.check?.status === 'irrelevant')
                                                ? requirement.check?.status
                                                : undefined,
                                            comment: (event.target as HTMLInputElement).value,
                                        };
                                        upsertCheck.mutate(input, {
                                            onError: (err) => {
                                                console.error("Could not save check:", err);
                                            },
                                        });
                                    }} />}
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
