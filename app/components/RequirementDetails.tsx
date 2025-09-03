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
            <div><b>Påstående:</b> {renderParagraphs(requirement.statement)}</div>
            <div className="mt-4"><b>Syfte:</b> {renderParagraphs(requirement.why)}</div>
            <DigiExpandableAccordion
                afHeading="Lagkrav och standarder"
            >
                <p><b>{requirement.criteria}</b> </p>
                <p><b>Princip:</b><br />{requirement.principle}</p>
                <p><b>Riktlinje:</b><br />{requirement.guideline}</p>
                <p><b>Kriterium:</b><br />{requirement.criteria}</p>

            </DigiExpandableAccordion>
            {requirement.howToTest &&
                <DigiExpandableAccordion
                    afHeading="Hur du kan testa"
                >
                    <div>{renderParagraphs(requirement.howToTest.content)}</div>
                </DigiExpandableAccordion>
            }
        </div>
    );
}
