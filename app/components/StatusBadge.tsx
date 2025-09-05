import { BadgeStatusType, BadgeStatusVariation, BadgeStatusSize } from "@digi/arbetsformedlingen";
import { DigiBadgeStatus } from "@digi/arbetsformedlingen-react";
import { Status } from "~/data/types"

type Props = {
    status?: string | null;
}

export default function StatusBadge({ status }: Props) {
    if (!status) { status = "not_assessed"; }
    const value = Status[status as keyof typeof Status];
    switch (value) {
        case Status.fail:
            return <DigiBadgeStatus
                afType={BadgeStatusType.DENIED}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={Status.fail}
                afSize={BadgeStatusSize.LARGE}
            />
        case Status.irrelevant:
            return <DigiBadgeStatus
                afType={BadgeStatusType.NEUTRAL}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={Status.irrelevant}
                afSize={BadgeStatusSize.LARGE}
            />
        case Status.pass:
            return <DigiBadgeStatus
                afType={BadgeStatusType.APPROVED}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={Status.pass}
                afSize={BadgeStatusSize.LARGE}
            />
        case Status.not_assessed:
            return <DigiBadgeStatus
                afType={BadgeStatusType.PROMPT}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={Status.not_assessed}
                afSize={BadgeStatusSize.LARGE}
            />
    }
}
