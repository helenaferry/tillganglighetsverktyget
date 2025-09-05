import { BadgeStatusType, BadgeStatusVariation, BadgeStatusSize } from "@digi/arbetsformedlingen";
import { DigiBadgeStatus } from "@digi/arbetsformedlingen-react";
import { Status } from "~/data/types"

type Props = {
    status?: number | undefined | null;
}

// TODO proper i18n?
const getStatusText = (status: Status) => {
    switch (status) {
        case Status.FAIL:
            return "Underkänd";
        case Status.IRRELEVANT:
            return "Irrelevant";
        case Status.PASS:
            return "Godkänd";
        case Status.NOT_ASSESSED:
            return "Ej bedömd";
        default:
            return "";
    }
}

export default function StatusBadge({ status }: Props) {
    const enumStatus = typeof status === 'number' ? status as Status : Status.NOT_ASSESSED;
    switch (enumStatus) {
        case Status.FAIL:
            return <DigiBadgeStatus
                afType={BadgeStatusType.DENIED}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={getStatusText(Status.FAIL)}
                afSize={BadgeStatusSize.LARGE}
            />
        case Status.IRRELEVANT:
            return <DigiBadgeStatus
                afType={BadgeStatusType.NEUTRAL}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={getStatusText(Status.IRRELEVANT)}
                afSize={BadgeStatusSize.LARGE}
            />
        case Status.PASS:
            return <DigiBadgeStatus
                afType={BadgeStatusType.APPROVED}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={getStatusText(Status.PASS)}
                afSize={BadgeStatusSize.LARGE}
            />
        case Status.NOT_ASSESSED:
            return <DigiBadgeStatus
                afType={BadgeStatusType.PROMPT}
                afVariation={BadgeStatusVariation.SECONDARY}
                afText={getStatusText(Status.NOT_ASSESSED)}
                afSize={BadgeStatusSize.LARGE}
            />
    }
}
