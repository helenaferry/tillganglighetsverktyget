import { DigiExpandableAccordion } from "@digi/arbetsformedlingen-react";
import type { Requirement } from "~/data/types";

export type Props = {
    requirement: Requirement;
};

export default function RequirementDetails({ requirement }: Props) {
    const renderParagraphs = (text: string) => {
        return text.split(/\n+/).map((p, i) => p.trim()).filter(Boolean).map((p, i) => <p key={i}>{p}</p>);
    }
    return (
        <div>
            {requirement.statement && <div><b>Påstående:</b> {renderParagraphs(requirement.statement)}</div>}
            {requirement.why && <div className="mt-4"><b>Syfte:</b> {renderParagraphs(requirement.why)}</div>}
            {requirement.howToTestContent &&
                <DigiExpandableAccordion
                    afHeading="Hur du kan testa"
                >
                    <div>{renderParagraphs(requirement.howToTestContent)}</div>
                </DigiExpandableAccordion>
            }
        </div>
    );
}
