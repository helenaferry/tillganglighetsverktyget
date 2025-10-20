import { BadgeStatusSize, BadgeStatusType, BadgeStatusVariation } from '@digi/arbetsformedlingen';
import { DigiBadgeStatus } from '@digi/arbetsformedlingen-react';

import { Status, StatusText } from '~/data/types';

type Props = {
  status?: number | undefined | null;
};

const getStatusText = (status: Status) => {
  switch (status) {
    case Status.FAIL:
      return StatusText.FAIL;
    case Status.IRRELEVANT:
      return StatusText.IRRELEVANT;
    case Status.PASS:
      return StatusText.PASS;
    case Status.NOT_ASSESSED:
      return StatusText.NOT_ASSESSED;
    default:
      return '';
  }
};

const getBadge = (status: Status) => {
  switch (status) {
    case Status.FAIL:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.DENIED}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.FAIL)}
          afSize={BadgeStatusSize.LARGE}
        />
      );
    case Status.IRRELEVANT:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.NEUTRAL}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.IRRELEVANT)}
          afSize={BadgeStatusSize.LARGE}
        />
      );
    case Status.PASS:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.APPROVED}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.PASS)}
          afSize={BadgeStatusSize.LARGE}
        />
      );
    case Status.NOT_ASSESSED:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.PROMPT}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.NOT_ASSESSED)}
          afSize={BadgeStatusSize.LARGE}
        />
      );
  }
};

export default function StatusBadge({ status }: Props) {
  const enumStatus = typeof status === 'number' ? (status as Status) : Status.NOT_ASSESSED;
  return <div className="min-w-[6rem]">{getBadge(enumStatus)}</div>;
}
