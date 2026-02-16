import { BadgeStatusSize, BadgeStatusType, BadgeStatusVariation } from '@designsystem-se/af';
import { DigiBadgeStatus } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import { Status } from '~/data/types';

type Props = {
  status?: number | undefined | null;
  plural?: boolean;
  noMinWidth?: boolean;
  ariaLabel?: string;
};

const getStatusText = (
  status: Status,
  plural: boolean,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  const key = plural ? 'Plural' : '';
  switch (status) {
    case Status.FAIL:
      return t(`Status.fail${key}`);
    case Status.IRRELEVANT:
      return t(`Status.irrelevant${key}`);
    case Status.PASS:
      return t(`Status.pass${key}`);
    case Status.NOT_ASSESSED:
      return t(`Status.notAssessed${key}`);
    default:
      return '';
  }
};

const getBadge = (
  status: Status,
  plural: boolean,
  ariaLabel: string | undefined,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  switch (status) {
    case Status.FAIL:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.DENIED}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.FAIL, plural, t)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
    case Status.IRRELEVANT:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.NEUTRAL}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.IRRELEVANT, plural, t)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
    case Status.PASS:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.APPROVED}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.PASS, plural, t)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
    case Status.NOT_ASSESSED:
      return (
        <DigiBadgeStatus
          afType={BadgeStatusType.MISSING}
          afVariation={BadgeStatusVariation.SECONDARY}
          afText={getStatusText(Status.NOT_ASSESSED, plural, t)}
          afSize={BadgeStatusSize.LARGE}
          afAriaLabel={ariaLabel}
        />
      );
  }
};

export default function StatusBadge({ status, plural = false, noMinWidth, ariaLabel }: Props) {
  const { t } = useTranslation();
  const enumStatus = typeof status === 'number' ? (status as Status) : Status.NOT_ASSESSED;
  return (
    <div className={`inline-block ${noMinWidth ? '' : 'min-w-[6rem]'}`} data-testid="status-badge">
      {getBadge(enumStatus, plural, ariaLabel, t)}
    </div>
  );
}
