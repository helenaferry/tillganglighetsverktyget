import { NotificationAlertSize, NotificationAlertVariation } from '@digi/arbetsformedlingen';
import { DigiNotificationAlert } from '@digi/arbetsformedlingen-react';
import { Status, type Check, type Requirement, type ReviewWithApplication } from '~/data/types';

type Props = {
  review: ReviewWithApplication;
  checks?: Check[];
  requirements: Requirement[];
};

export default function CreateStatement({ review, checks, requirements }: Props) {
  const failedChecks = checks
    ? checks.filter(
        (check) => check.status === 0 || check.status === null || check.status === undefined,
      )
    : [];
  const numberOfDone = checks
    ? checks.filter(
        (check) =>
          check.status === Status.PASS ||
          check.status === Status.FAIL ||
          check.status === Status.IRRELEVANT,
      ).length
    : 0;
  const numberOfNotAssessed = requirements.length - numberOfDone;

  return (
    <div className="content-container">
      {numberOfNotAssessed > 0 && (
        <DigiNotificationAlert
          afSize={NotificationAlertSize.LARGE}
          afVariation={NotificationAlertVariation.DANGER}
          afHeading="Ofullständig granskning"
        >
          Granskningen innehåller {numberOfNotAssessed} ohanterade krav. För att skapa en korrekt
          tillgänglighetsredogörelse behöver alla krav vara bedömda.
        </DigiNotificationAlert>
      )}
      <p className="pt-8">
        <b>Granskning:</b> {review.title}
      </p>
      <h2>Underkända krav</h2>
      <p>TODO: Gör nåt med dessa :)</p>
      {failedChecks.map((check) => {
        const requirement = requirements.find(
          (req) => String(req.id) === String(check.requirement),
        );
        return (
          <div key={check.id} className="mt-4">
            {requirement?.name} {check.comment && <>- {check.comment}</>}
          </div>
        );
      })}
    </div>
  );
}
