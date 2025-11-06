import { BadgeStatusSize, BadgeStatusType, BadgeStatusVariation } from '@designsystem-se/af';
import { DigiBadgeStatus } from '@designsystem-se/af-react';

import { Status, StatusText, StatusTextPlural } from '~/data/types';

type Props = {
  status?: number | undefined | null;
  plural?: boolean;
  noMinWidth?: boolean;
  ariaLabel?: string;
};

const getStatusText = (status: Status, plural?: boolean) => {
  switch (status) {
    case Status.FAIL:
      return plural ? StatusTextPlural.FAIL : StatusText.FAIL;
    case Status.IRRELEVANT:
      return plural ? StatusTextPlural.IRRELEVANT : StatusText.IRRELEVANT;
    case Status.PASS:
      return plural ? StatusTextPlural.PASS : StatusText.PASS;
    case Status.NOT_ASSESSED:
      return plural ? StatusTextPlural.NOT_ASSESSED : StatusText.NOT_ASSESSED;
    default:
      return '';
  }
};

const getBadge = (status: Status, plural?: boolean, ariaLabel?: string) => {
  switch (status) {
    case Status.FAIL:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.DENIED}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.FAIL, plural)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
    case Status.IRRELEVANT:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.NEUTRAL}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.IRRELEVANT, plural)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
    case Status.PASS:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.APPROVED}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.PASS, plural)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
    case Status.NOT_ASSESSED:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.MISSING}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.NOT_ASSESSED, plural)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
  }
};

export default function StatusBadge({ status, plural, noMinWidth, ariaLabel }: Props) {
  const enumStatus = typeof status === 'number' ? (status as Status) : Status.NOT_ASSESSED;
  return (
    <div className={noMinWidth ? '' : 'min-w-[6rem]'}>
      {getBadge(enumStatus, plural, ariaLabel)}
    </div>
  );
}
